// Magnifier for a picture inside a fixed frame (the building viewer's floor plans, the apartment
// page's crops): + / − buttons with two steps (1.5×, 2×), drag to move around while magnified.
// A drag never also counts as a click on what's under the pointer (e.g. picking an apartment).
// Markup: a `.zoom-ctrl` with two buttons, data-zoom="in" / "out" (styles in global.css).
const STEPS = [1, 1.5, 2];

export function createLens(frame: HTMLElement, layer: HTMLElement, ctrl: HTMLElement, onDragStart?: () => void) {
  let z = 1, pan = { x: 0, y: 0 };
  const [zin, zout] = ctrl.querySelectorAll<HTMLButtonElement>('button');

  function set(next: number) {
    pan = { x: pan.x * next / z, y: pan.y * next / z };   // keep the same spot in the middle
    z = next;
    apply();
  }
  function apply() {
    const r = frame.getBoundingClientRect();
    const mx = (z - 1) * r.width / 2, my = (z - 1) * r.height / 2;
    pan = { x: Math.max(-mx, Math.min(mx, pan.x)), y: Math.max(-my, Math.min(my, pan.y)) };
    layer.style.transform = z === 1 ? '' : `translate(${pan.x}px, ${pan.y}px) scale(${z})`;
    layer.classList.toggle('lensed', z > 1);
    zin.disabled = z === STEPS[STEPS.length - 1];
    zout.disabled = z === 1;
  }

  ctrl.addEventListener('click', e => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!b) return;
    const i = STEPS.indexOf(z) + (b.dataset.zoom === 'in' ? 1 : -1);
    set(STEPS[Math.max(0, Math.min(STEPS.length - 1, i))]);
  });

  layer.addEventListener('dragstart', e => e.preventDefault());   // no "ghost image" drag of the pictures
  let drag: { x: number; y: number; px: number; py: number; moved: boolean } | null = null;
  layer.addEventListener('pointerdown', e => {
    if (z > 1) drag = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y, moved: false };
  });
  window.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    if (!drag.moved) { drag.moved = true; layer.classList.add('dragging'); onDragStart?.(); }
    pan = { x: drag.px + dx, y: drag.py + dy };
    apply();
  });
  window.addEventListener('pointerup', () => {
    if (!drag) return;
    layer.classList.remove('dragging');
    if (drag.moved) layer.addEventListener('click', e => e.stopPropagation(), { capture: true, once: true });
    drag = null;
  });

  apply();
  return { reset: () => { pan = { x: 0, y: 0 }; set(1); } };
}
