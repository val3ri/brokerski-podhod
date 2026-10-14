"""
Align an AI-generated floor render back onto its clean floor plan, pixel for pixel, so the apartment
outlines in src/data/buildings.ts (Floor.units, % of the plan image) fit the render too.

The render was generated from sonar-files/ai-renders/input/etazh-N.png: the plan cropped to the
building and padded to 3:2 (see make_input()). AI tools return roughly that framing but often
slightly shifted/scaled or at another size, so we:
  1. undo the known crop/pad (rough placement),
  2. refine with OpenCV ECC on the *walls* of both images (dark pixels: teal in the plan,
     charcoal in the render), which are the one thing the two images share.
Prints the match score and writes a check image (plan walls in red over the render).

Usage (needs: pip install opencv-python-headless numpy pillow):
  python3 scripts/align-render.py <plan.png> <render.png> <out.jpg> [--init scale,tx,ty] [--roi x0,y0,x1,y1]
  python3 scripts/align-render.py --make-input <plan.png> <input.png>
"""
import sys

import cv2
import numpy as np

INPUT_SIZE = (1536, 1024)   # 3:2, what most image tools output


def crop_box(plan):
    """Building bounds + margin, padded to 3:2 — must stay identical to the exported input."""
    dark = plan.sum(axis=2) < 600
    ys, xs = np.where(dark)
    m = 40
    x0, y0 = max(0, xs.min() - m), max(0, ys.min() - m)
    x1, y1 = min(plan.shape[1], xs.max() + m), min(plan.shape[0], ys.max() + m)
    w, h = x1 - x0, y1 - y0
    tw, th = (w, round(w * 2 / 3)) if w / h >= 1.5 else (round(h * 1.5), h)
    return x0, y0, x1, y1, tw, th, (tw - w) // 2, (th - h) // 2


def make_input(plan_path, out_path):
    plan = cv2.imread(plan_path)
    x0, y0, x1, y1, tw, th, ox, oy = crop_box(plan[:, :, ::-1].astype(int))
    canvas = np.full((th, tw, 3), 255, np.uint8)
    canvas[oy:oy + (y1 - y0), ox:ox + (x1 - x0)] = plan[y0:y1, x0:x1]
    cv2.imwrite(out_path, cv2.resize(canvas, INPUT_SIZE, interpolation=cv2.INTER_AREA))


def walls(img, thresh):
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    m = (g < thresh).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))   # walls are thick; drop thin lines
    return cv2.GaussianBlur(m, (0, 0), 6).astype(np.float32) / 255


def search_init(pm, rm, step=8):
    """Coarse search over scale + position (for renders the AI reframed a lot): slide the render's
    wall mask over the plan's at 1/step resolution and keep the best match."""
    P = cv2.resize(pm, None, fx=1 / step, fy=1 / step)
    best = (-1, None)
    for s in np.linspace(0.6, 2.2, 33):                # plan px per render px
        T = cv2.resize(rm, None, fx=s / step, fy=s / step)
        ph, pw = max(P.shape[0], T.shape[0]) + 2, max(P.shape[1], T.shape[1]) + 2
        pad = np.zeros((ph + T.shape[0], pw + T.shape[1]), np.float32)
        oy, ox = T.shape[0], T.shape[1]
        pad[oy:oy + P.shape[0], ox:ox + P.shape[1]] = P
        res = cv2.matchTemplate(pad, T, cv2.TM_CCORR_NORMED)
        _, score, _, (x, y) = cv2.minMaxLoc(res)
        if score > best[0]:
            px, py = (x - ox) * step, (y - oy) * step   # render (0,0) lands here in plan px
            best = (score, np.array([[1 / s, 0, -px / s], [0, 1 / s, -py / s]], np.float32))
    return best[1]


def refine(pm, rm, warp):
    for scale in (0.25, 0.5):
        p_s = cv2.resize(pm, None, fx=scale, fy=scale)
        r_s = cv2.resize(rm, None, fx=scale, fy=scale)
        w_s = warp.copy()
        w_s[:, 2] *= scale
        crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6)
        try:
            score, w_s = cv2.findTransformECC(p_s, r_s, w_s, cv2.MOTION_AFFINE, crit, None, 5)
        except cv2.error:
            return -1, warp
        warp = w_s.copy()
        warp[:, 2] /= scale
    return score, warp


def align(plan_path, render_path, out_path, init=None, roi=None):
    """init: (scale, tx, ty) — plan_px = render_px * scale + t, for renders the automatic start
    can't find; roi: (x0, y0, x1, y1) plan px — match only the building (e.g. when the plan's yard
    walls look nothing like the render's fences)."""
    plan = cv2.imread(plan_path)
    render = cv2.imread(render_path)
    H, W = plan.shape[:2]
    rh, rw = render.shape[:2]
    x0, y0, x1, y1, tw, th, ox, oy = crop_box(plan[:, :, ::-1].astype(int))

    # rough: plan pixel → render pixel through the input canvas
    sx, sy = rw / tw, rh / th
    warp = np.array([[sx, 0, (ox - x0) * sx], [0, sy, (oy - y0) * sy]], np.float32)

    # refine on wall masks from two starting guesses — the known input framing, and a coarse
    # scale/position search — and keep whichever matches better
    pm, rm = walls(plan, 90), walls(render, 70)
    if roi:
        keep = np.zeros_like(pm)
        keep[roi[1]:roi[3], roi[0]:roi[2]] = 1
        pm *= keep
    if init:
        sc, tx, ty = init
        score, warp = refine(pm, rm, np.array([[1 / sc, 0, -tx / sc], [0, 1 / sc, -ty / sc]], np.float32))
    else:
        score, warp = max(refine(pm, rm, warp), refine(pm, rm, search_init(pm, rm)), key=lambda r: r[0])
    print(f'wall match score: {score:.3f}  (above ~0.6 is good; low = check the render)')

    aligned = cv2.warpAffine(render, warp, (W, H), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP,
                             borderMode=cv2.BORDER_CONSTANT, borderValue=(255, 255, 255))
    cv2.imwrite(out_path, aligned, [cv2.IMWRITE_JPEG_QUALITY, 86])

    check = aligned.copy()
    check[plan.sum(axis=2) < 300] = (0, 0, 255)
    check_path = out_path.rsplit('.', 1)[0] + '.check.jpg'
    cv2.imwrite(check_path, cv2.resize(check, None, fx=0.5, fy=0.5))
    print(f'wrote {out_path}\ncheck: {check_path}  (red = plan walls; they should sit on the render walls)')


if __name__ == '__main__':
    if sys.argv[1] == '--make-input':
        make_input(sys.argv[2], sys.argv[3])
    else:
        # optional: --init scale,tx,ty  --roi x0,y0,x1,y1
        opts = dict(zip(sys.argv[4::2], sys.argv[5::2]))
        num = lambda k, t: tuple(t(v) for v in opts[k].split(',')) if k in opts else None
        align(sys.argv[1], sys.argv[2], sys.argv[3], init=num('--init', float), roi=num('--roi', int))
