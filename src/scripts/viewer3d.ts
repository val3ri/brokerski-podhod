// 3D building viewer for /obekti/<slug>: orbit the building → click a floor → click an apartment.
// Works on two kinds of input, reduced to the same structure (floor_N / unit_<number> nodes):
//  - a real .glb following the naming convention (README "3D models")
//  - a procedural massing model generated from the suites (placeholder until a real model exists)
// Loaded with a dynamic import() so pages without 3D never download three.js.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface ViewerSuite {
  number: string; type: string; size: string; floors: number[];
  status: 'available' | 'reserved' | 'sold';
}
export interface Viewer3DOptions {
  suites: ViewerSuite[];
  modelUrl?: string;
  procedural?: { floors: number; width: number; depth: number; floorHeight?: number };
  onPickFloor(floor: number): void;
  onPickUnit(unit: string): void;
  // hover tooltip: text + pointer position inside the container, or null to hide
  onHover(text: string | null, x: number, y: number): void;
  hoverText(floor: number, unit: string | null): string;
}
export interface Viewer3D {
  hasFloors: boolean;
  setState(floor: number | null, unit: string | null): void;
  dispose(): void;
}

// ink palette — black is "for sale", same rule as the map (Planning.md §6)
const C = {
  paper: 0xfaf9f7,
  pale: 0xe2dccd,
  hover: 0xb9b09a,
  available: 0x2c2b28,
  availableHover: 0x55524b,
  reserved: 0x8f8a7a,
  sold: 0xeee9de,
  selected: 0xb8894a,
  ink: 0x2c2b28,
};

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

type Info = { floor?: number; unit?: string; role?: 'slab' | 'unit' };

export async function createViewer3D(container: HTMLElement, opts: Viewer3DOptions): Promise<Viewer3D> {
  const root = opts.modelUrl ? await loadModel(opts.modelUrl) : buildProcedural(opts);
  const procedural = !opts.modelUrl;
  const statusOf = new Map(opts.suites.map(s => [s.number, s.status]));

  // --- index meshes by floor / unit (walk up the node names) ---
  const meshes: THREE.Mesh[] = [];
  const info = new Map<THREE.Object3D, Info>();
  const floorNodes = new Map<number, THREE.Object3D>();
  root.traverse(o => {
    const f = /^floor_(\d+)$/.exec(o.name);
    if (f) floorNodes.set(+f[1], o);
  });
  root.traverse(o => {
    if (!(o as THREE.Mesh).isMesh) return;
    const mesh = o as THREE.Mesh;
    const i: Info = { role: mesh.userData.role };
    for (let p: THREE.Object3D | null = mesh; p; p = p.parent) {
      const u = /^unit_(.+)$/.exec(p.name);
      if (u && i.unit === undefined) i.unit = u[1];
      const f = /^floor_(\d+)$/.exec(p.name);
      if (f && i.floor === undefined) i.floor = +f[1];
    }
    // units without a floor_ parent: take the floor from the data
    if (i.floor === undefined && i.unit) i.floor = opts.suites.find(s => s.number === i.unit)?.floors[0];
    info.set(mesh, i);
    meshes.push(mesh);
  });
  const hasFloors = floorNodes.size > 0 || [...info.values()].some(i => i.floor !== undefined);

  // --- ink look: one lit flat material per color + edge lines on everything ---
  const mats = new Map<number, THREE.Material>();
  const mat = (color: number) => {
    if (!mats.has(color)) mats.set(color, new THREE.MeshLambertMaterial({ color }));
    return mats.get(color)!;
  };
  const lineMat = new THREE.LineBasicMaterial({ color: C.ink, transparent: true, opacity: .75 });
  for (const m of meshes) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 30), lineMat));

  // center on the ground, measure
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= box.min.y;
  root.updateMatrixWorld(true);
  const size = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());

  // per-floor bounds (for camera framing and hiding things above the selected floor)
  const floorBox = new Map<number, THREE.Box3>();
  const meshBox = new Map<THREE.Mesh, THREE.Box3>();
  for (const m of meshes) {
    const b = new THREE.Box3().setFromObject(m);
    meshBox.set(m, b);
    const f = info.get(m)!.floor;
    if (f !== undefined) floorBox.set(f, (floorBox.get(f) ?? new THREE.Box3()).union(b));
  }

  // --- scene ---
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(C.paper);
  scene.add(new THREE.AmbientLight(0xffffff, 1.9));
  const sun = new THREE.DirectionalLight(0xffffff, 1.1);
  sun.position.set(-1, 2.2, 1.4);
  scene.add(sun);
  scene.add(root);

  const groundR = Math.max(size.x, size.z) * 0.9;
  const ground = new THREE.Mesh(new THREE.CircleGeometry(groundR, 64),
    new THREE.MeshBasicMaterial({ color: 0xf2eee3 }));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  const ring = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(
      Array.from({ length: 64 }, (_, k) => new THREE.Vector3(
        Math.cos(k / 64 * Math.PI * 2) * groundR, 0.01, Math.sin(k / 64 * Math.PI * 2) * groundR))),
    new THREE.LineDashedMaterial({ color: C.ink, dashSize: .6, gapSize: .5 }));
  ring.computeLineDistances();
  scene.add(ring);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 2000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.maxPolarAngle = Math.PI * 0.47;   // never under the ground
  const radius = size.length() / 2;
  controls.minDistance = radius * 0.8;
  controls.maxDistance = radius * 7;

  // camera "shots": whole building from a 3/4 angle, a floor from higher up (plan-like)
  const dist = radius / Math.sin(THREE.MathUtils.degToRad(35 / 2)) * 1.2;
  function shot(floor: number | null) {
    const azimuth = Math.atan2(camera.position.x - controls.target.x, camera.position.z - controls.target.z);
    const az = floor === null && !started ? THREE.MathUtils.degToRad(35) : azimuth;
    let target: THREE.Vector3, polar: number, d: number;
    if (floor === null || !floorBox.has(floor)) {
      target = new THREE.Vector3(0, size.y * 0.42, 0); polar = THREE.MathUtils.degToRad(66); d = dist;
    } else {
      const fb = floorBox.get(floor)!;
      target = new THREE.Vector3(0, (fb.min.y + fb.max.y) / 2, 0); polar = THREE.MathUtils.degToRad(45);
      d = Math.max(size.x, size.z) / Math.sin(THREE.MathUtils.degToRad(35 / 2)) * 0.8;
    }
    const pos = new THREE.Vector3(
      Math.sin(polar) * Math.sin(az), Math.cos(polar), Math.sin(polar) * Math.cos(az)).multiplyScalar(d).add(target);
    return { pos, target };
  }
  let started = false;
  const first = shot(null);
  camera.position.copy(first.pos);
  controls.target.copy(first.target);
  started = true;

  // smooth camera move
  let tween: { from: { pos: THREE.Vector3; target: THREE.Vector3 }; to: { pos: THREE.Vector3; target: THREE.Vector3 }; t0: number } | null = null;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function moveTo(to: { pos: THREE.Vector3; target: THREE.Vector3 }) {
    if (reduceMotion) { camera.position.copy(to.pos); controls.target.copy(to.target); return; }
    tween = { from: { pos: camera.position.clone(), target: controls.target.clone() }, to, t0: performance.now() };
  }

  // --- state → visibility + colors ---
  let state: { floor: number | null; unit: string | null } = { floor: null, unit: null };
  let hover: { floor?: number; unit?: string } = {};

  function apply() {
    const sel = state.floor;
    const selTop = sel !== null ? floorBox.get(sel)?.max.y ?? Infinity : Infinity;
    for (const m of meshes) {
      const i = info.get(m)!;
      let visible = true;
      if (sel !== null) {
        if (i.floor !== undefined) visible = i.floor <= sel;
        else visible = meshBox.get(m)!.min.y < selTop - 0.05;   // roofs etc. above the floor go
      }
      // procedural: whole-floor slabs in building view, apartments only on the opened floor
      if (procedural && i.role === 'slab') visible &&= sel !== i.floor;
      if (procedural && i.role === 'unit') visible &&= sel === i.floor;
      m.visible = visible;
      if (!visible) continue;

      let color = C.pale;
      if (sel === null) {
        if (hover.floor !== undefined && i.floor === hover.floor) color = C.hover;
      } else if (i.floor === sel && i.unit) {
        const st = statusOf.get(i.unit) ?? 'sold';
        color = i.unit === state.unit ? C.selected
          : st === 'available' ? (hover.unit === i.unit ? C.availableHover : C.available)
          : st === 'reserved' ? C.reserved : C.sold;
        if (hover.unit === i.unit && st !== 'available' && i.unit !== state.unit) color = C.hover;
      } else if (i.floor !== undefined && i.floor < (sel ?? 0) && hover.floor === i.floor) {
        color = C.hover;
      }
      m.material = mat(color);
    }
  }

  // --- picking ---
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function pick(ev: PointerEvent): Info | null {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set((ev.clientX - r.left) / r.width * 2 - 1, -(ev.clientY - r.top) / r.height * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(meshes.filter(m => m.visible), false)[0];
    return hit ? info.get(hit.object)! : null;
  }
  // in floor view: the opened floor's apartments are targets, lower floors switch floors
  function target(i: Info | null): { floor?: number; unit?: string } {
    if (!i || i.floor === undefined) return {};
    if (state.floor !== null && i.floor === state.floor) return i.unit ? { unit: i.unit } : {};
    return { floor: i.floor };
  }

  let down: { x: number; y: number } | null = null;
  const el = renderer.domElement;
  const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; };
  const onMove = (e: PointerEvent) => {
    if (e.buttons) return;
    const t = target(pick(e));
    if (t.floor !== hover.floor || t.unit !== hover.unit) { hover = t; apply(); }
    el.style.cursor = t.floor !== undefined || t.unit ? 'pointer' : 'grab';
    const r = el.getBoundingClientRect();
    const f = t.unit ? state.floor! : t.floor;
    opts.onHover(f !== undefined ? opts.hoverText(f, t.unit ?? null) : null, e.clientX - r.left, e.clientY - r.top);
  };
  const onLeave = () => { hover = {}; apply(); opts.onHover(null, 0, 0); };
  const onUp = (e: PointerEvent) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) { down = null; return; }
    down = null;
    const t = target(pick(e));
    if (t.unit) opts.onPickUnit(t.unit);
    else if (t.floor !== undefined) opts.onPickFloor(t.floor);
  };
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
  el.addEventListener('pointerup', onUp);

  // --- loop (paused while off-screen) ---
  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  let onScreen = true, raf = 0;
  const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; });
  io.observe(container);
  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (!onScreen) return;
    if (tween) {
      const k = Math.min(1, (now - tween.t0) / 800);
      const e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      camera.position.lerpVectors(tween.from.pos, tween.to.pos, e);
      controls.target.lerpVectors(tween.from.target, tween.to.target, e);
      if (k === 1) tween = null;
    }
    controls.update();
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);
  apply();

  return {
    hasFloors,
    setState(floor, unit) {
      const floorChanged = floor !== state.floor;
      state = { floor, unit };
      hover = {};
      apply();
      if (floorChanged) moveTo(shot(floor));
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      controls.dispose();
      renderer.dispose();
      el.remove();
    },
  };
}

async function loadModel(url: string) {
  const gltf = await new GLTFLoader().loadAsync(url);
  return gltf.scene;
}

// placeholder massing: one slab per floor (building view) + one box per apartment, widths
// proportional to their m² (floor view). Real models replace this 1:1 via the naming convention.
function buildProcedural(opts: Viewer3DOptions) {
  const { floors, width, depth, floorHeight = 3.2 } = opts.procedural!;
  const geo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const root = new THREE.Group();
  const box = (w: number, h: number, d: number, x: number, y: number, role: 'slab' | 'unit') => {
    const m = new THREE.Mesh(geo);
    m.scale.set(w, h, d);
    m.position.set(x, y, 0);
    m.userData.role = role;
    return m;
  };
  for (let f = 1; f <= floors; f++) {
    const y = (f - 1) * floorHeight;
    const group = new THREE.Group();
    group.name = `floor_${f}`;
    group.add(box(width, floorHeight - 0.25, depth, 0, y, 'slab'));
    const units = opts.suites.filter(s => s.floors.includes(f));   // a maisonette appears on each of its floors
    const areas = units.map(s => parseFloat(s.size) || 50);
    const total = areas.reduce((a, b) => a + b, 0);
    let x = -width / 2;
    units.forEach((s, k) => {
      const w = width * areas[k] / total;
      const u = new THREE.Group();
      u.name = `unit_${s.number}`;
      u.add(box(w - 0.5, floorHeight - 0.35, depth - 0.8, x + w / 2, y, 'unit'));
      group.add(u);
      x += w;
    });
    root.add(group);
  }
  const roof = box(width + 0.6, 0.35, depth + 0.6, 0, floors * floorHeight - 0.2, 'slab');
  roof.name = 'roof';
  root.add(roof);
  return root;
}
