"""
Buyer-friendly floor plans from the architect's ArchiCAD PDFs.

The PDFs keep ArchiCAD's layers (PDF optional-content groups), so instead of tracing anything we
redraw only the layers a buyer needs — walls, columns, stairs, sanitary, furniture — in the site's
colors, and drop dimensions, axes, hatching, section marks, beams and all technical text.
Room names + m² are extracted as data (not baked into the image) and written to a JSON file next
to the image, so the site renders them as live text (translatable, crisp, Montserrat).

The crop is the same for every floor of a building, so outlines in src/data/buildings.ts
(Floor.units, in % of the image) stay valid.

Usage (needs PyMuPDF: pip install pymupdf):
  python3 scripts/clean-floor-plans.py "<pdf>" <out-basename>
  e.g. python3 scripts/clean-floor-plans.py "sonar-files/архитектура сграда А =PDF/4 СГРАДА А РАЗПРЕДЕЛЕНИЕ КОТА +3.05.pdf" src/assets/sgrada-a/floor-2
"""
import json
import re
import sys

import pymupdf as fitz

CROP = (0.12, 0.12, 0.72, 0.88)   # fraction of the sheet: drawing area without the title block
DPI = 110

WALL_LAYERS = {
    'АРХ-секция А.стени Интериор', 'АРХ-секция А.стени Екстерио', 'АРХ-секция Б.стени Екстерио',
    'АРХ-секция А.колони', 'АРХ.стени-борд',
}
DETAIL_LAYERS = {
    'АРХ.ВиК', 'АРХ.обекти помещения', 'АРХ.стълби', 'A_Lift_Kone', 'АРХ.плоча',
    'АРХ-секция А.обекти екстериор',
}
SKIP_ROOMS = {'Козирка', 'Покрив'}   # canopies, roof slab: on the drawing, not something a buyer cares about
# architect's abbreviations → plain words for buyers
RENAME = {
    'Дневня / Трап': 'Дневна',      # short on purpose: labels sit in narrow maisonette plans
    'Дневня': 'Дневна',
    'Кухн. бокс': 'Кухня',
    'Предверие': 'Преддверие',
}

TEAL = (1 / 255, 54 / 255, 56 / 255)        # --sonar-teal, same as the client's catalogue plans
DETAIL = (0.42, 0.46, 0.46)
HATCH_GRAY = (0.46, 0.46, 0.46)


def replay(shape, d, color=None, fill=None, width=0.0):
    for it in d['items']:
        op = it[0]
        if op == 'l':
            shape.draw_line(it[1], it[2])
        elif op == 're':
            shape.draw_rect(it[1])
        elif op == 'qu':
            shape.draw_quad(it[1])
        elif op == 'c':
            shape.draw_bezier(it[1], it[2], it[3], it[4])
    shape.finish(color=color, fill=fill, width=width, closePath=d.get('closePath', False),
                 even_odd=d.get('even_odd', False))


def close(a, b, tol=0.02):
    return a is not None and all(abs(x - y) < tol for x, y in zip(a, b))


def clean(pdf_path, out_base):
    src = fitz.open(pdf_path)[0]
    W, H = src.rect.width, src.rect.height
    clip = fitz.Rect(CROP[0] * W, CROP[1] * H, CROP[2] * W, CROP[3] * H)

    out = fitz.open()
    page = out.new_page(width=W, height=H)
    page.draw_rect(page.rect, color=None, fill=(1, 1, 1))
    details, walls = page.new_shape(), page.new_shape()

    for d in src.get_drawings():
        # inflate first: a perfectly horizontal/vertical line has a zero-width rect, which PyMuPDF
        # treats as empty — it would never "intersect" and every straight line would be lost
        if not (d['rect'] + (-1, -1, 1, 1)).intersects(clip):
            continue
        layer = d.get('layer') or ''
        if layer in DETAIL_LAYERS:
            r = d['rect']
            # the slab layer also carries the terrace paving pattern (thousands of tiny marks) —
            # keep only its real edges
            if layer == 'АРХ.плоча' and max(r.width, r.height) < 15:
                continue
            if d.get('color') is not None:
                replay(details, d, color=DETAIL, width=0.55)
        elif layer in WALL_LAYERS:
            if d.get('fill') is not None:
                # wall bodies (white / grey masks under the hatch) → solid teal
                replay(walls, d, fill=TEAL)
            elif d.get('color') is not None and not close(d['color'], HATCH_GRAY):
                # doors, windows, wall outlines — the grey ones are the hatch pattern, dropped
                replay(walls, d, color=TEAL, width=0.6)
    details.commit()
    walls.commit()   # walls on top, so furniture never runs over a wall

    # room stamps: name (9.7pt) / code / "12,74 m2" — keep name + area, drop the code
    lines = []
    for b in src.get_text('dict', clip=clip)['blocks']:
        for l in b.get('lines', []):
            text = ''.join(s['text'] for s in l['spans']).strip()
            span = l['spans'][0]
            lines.append((fitz.Rect(l['bbox']), text, span['size'], span['color']))
    rooms = []
    for rect, text, size, color in lines:
        if color != 0 or abs(size - 9.7) > 0.3 or not re.fullmatch(r'[А-Яа-яA-Za-z ./]+', text) or text in SKIP_ROOMS:
            continue
        area = next((t for r, t, s, c in lines
                     if abs(r.x0 - rect.x0) < 2 and 0 < r.y0 - rect.y0 < 30 and re.fullmatch(r'\d+,\d+ m2', t)), None)
        cx = (rect.x0 + rect.x1) / 2 if area is None else rect.x0 + 18
        cy = rect.y0 + (12 if area else 5)
        rooms.append({
            'name': RENAME.get(text, text),
            'area': area.replace(' m2', ' м²') if area else None,
            'x': round((cx - clip.x0) / clip.width * 100, 2),
            'y': round((cy - clip.y0) / clip.height * 100, 2),
        })

    page.get_pixmap(dpi=DPI, clip=clip).save(f'{out_base}.png')
    with open(f'{out_base}.rooms.json', 'w', encoding='utf-8') as f:
        json.dump(rooms, f, ensure_ascii=False, indent=1)
    print(f'{out_base}.png  ({len(rooms)} rooms)')


if __name__ == '__main__':
    clean(sys.argv[1], sys.argv[2])
