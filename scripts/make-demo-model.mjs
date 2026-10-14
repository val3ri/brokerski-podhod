// Generates public/models/obekt-3/building.glb — a placeholder "architect model" that follows the
// naming convention the building viewer expects (see README "3D models"):
//   floor_<N>      node grouping everything on floor N (1 = ground)
//   unit_<number>  node/mesh of one apartment, <number> = Suite.number in src/data/buildings.ts
// Anything else (corridors, roof, stairs) is fine to include and is drawn as plain building.
//
// Run: node scripts/make-demo-model.mjs
import { Document, NodeIO } from '@gltf-transform/core';
import { mkdirSync } from 'node:fs';

const doc = new Document();
const buffer = doc.createBuffer();
const scene = doc.createScene('building');
const material = doc.createMaterial('facade').setBaseColorFactor([0.85, 0.83, 0.78, 1]);

// one shared unit cube (1×1×1, base at y=0); every box is a node scaling/placing it
function unitCube() {
  const p = [], n = [], idx = [];
  const faces = [
    [[1,0,0],[0,1,0],[0,0,1]], [[-1,0,0],[0,1,0],[0,0,-1]],
    [[0,1,0],[0,0,1],[1,0,0]], [[0,-1,0],[0,0,-1],[1,0,0]],
    [[0,0,1],[1,0,0],[0,1,0]], [[0,0,-1],[-1,0,0],[0,1,0]],
  ];
  for (const [nrm, u, v] of faces) {
    const base = p.length / 3;
    for (const [su, sv] of [[-1,-1],[1,-1],[1,1],[-1,1]]) {
      p.push(
        (nrm[0] + u[0] * su + v[0] * sv) / 2,
        (nrm[1] + u[1] * su + v[1] * sv) / 2 + 0.5,
        (nrm[2] + u[2] * su + v[2] * sv) / 2,
      );
      n.push(...nrm);
    }
    // winding follows u × v = normal, so faces point outward
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  const acc = (type, arr, T) => doc.createAccessor().setType(type).setArray(new T(arr)).setBuffer(buffer);
  const prim = doc.createPrimitive()
    .setAttribute('POSITION', acc('VEC3', p, Float32Array))
    .setAttribute('NORMAL', acc('VEC3', n, Float32Array))
    .setIndices(acc('SCALAR', idx, Uint16Array))
    .setMaterial(material);
  return doc.createMesh('cube').addPrimitive(prim);
}
const cube = unitCube();

const box = (name, [x, y, z], [w, h, d]) =>
  doc.createNode(name).setMesh(cube).setTranslation([x, y, z]).setScale([w, h, d]);

const FH = 3.2; // floor height, m

// floors 1–2: two apartments each + a central stair/corridor core
for (const [floor, left, right] of [[1, '1', '2'], [2, '3', '4']]) {
  const y = (floor - 1) * FH;
  const f = doc.createNode(`floor_${floor}`);
  f.addChild(box(`unit_${left}`, [-7.5, y, 0], [11, FH - 0.2, 14]));
  f.addChild(box(`unit_${right}`, [7.5, y, 0], [11, FH - 0.2, 14]));
  f.addChild(box(`core_${floor}`, [0, y, 0], [4, FH - 0.2, 8]));
  scene.addChild(f);
}
// floor 3: set-back penthouse (maisonette) + terrace slab
const f3 = doc.createNode('floor_3');
f3.addChild(box('unit_5', [-3, 2 * FH, 0], [16, FH - 0.2, 10]));
f3.addChild(box('terrace_3', [0, 2 * FH, 0], [26, 0.25, 14]));
scene.addChild(f3);
scene.addChild(box('roof', [-3, 3 * FH - 0.2, 0], [17, 0.4, 11]));

mkdirSync('public/models/obekt-3', { recursive: true });
await new NodeIO().write('public/models/obekt-3/building.glb', doc);
console.log('wrote public/models/obekt-3/building.glb');
