import * as THREE from 'three';
import { zipSync } from 'three/examples/jsm/libs/fflate.module.js';
import { describe, expect, it } from 'vitest';
import { loadObj, ObjImportError } from '../src/index.js';
import { sample } from './files.js';

const meshes = (g: THREE.Object3D) => {
  const out: THREE.Mesh[] = [];
  g.traverse((o) => (o as THREE.Mesh).isMesh && out.push(o as THREE.Mesh));
  return out;
};

// A textured quad and a red triangle, with a material library and a 1 x 1 PNG.
const OBJ = `mtllib parts.mtl
v 0 0 0
v 1 0 0
v 1 1 0
v 0 1 0
vt 0 0
vt 1 0
vt 1 1
vt 0 1
o Quad
usemtl Checker
f 1/1 2/2 3/3 4/4
o Triangle
usemtl Red
f 1 2 4
`;
const MTL = `newmtl Checker
Kd 1 1 1
Ns 50
map_Kd textures/checker.png
newmtl Red
Kd 1 0 0
d 0.5
`;
const PNG = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='), (c) => c.charCodeAt(0));
const files = () => [
  { name: 'parts.obj', data: OBJ },
  { name: 'parts.mtl', data: MTL },
  { name: 'textures/checker.png', data: PNG },
];

describe('OBJ', () => {
  it('reads a model with its material library and textures', async () => {
    const r = await loadObj(files());
    expect(r.materialLibraries).toEqual(['parts.mtl']);
    expect(r.missing).toEqual([]);
    expect(r.stats).toMatchObject({ meshes: 2, triangles: 3, materials: 2, textures: 1 });
    const [quad, tri] = meshes(r.group);
    const checker = quad!.material as THREE.MeshStandardMaterial;
    expect(checker).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(checker.name).toBe('Checker');
    expect(checker.map).toBeTruthy();
    const red = tri!.material as THREE.MeshStandardMaterial;
    expect(red.color.getHexString()).toBe('ff0000');
    expect(red.transparent).toBe(true);
    expect(red.opacity).toBe(0.5);
    expect(r.group.name).toBe('parts');
  });

  it('keeps Phong materials when asked', async () => {
    const r = await loadObj(files(), { materialType: 'phong' });
    expect(meshes(r.group)[0]!.material).toBeInstanceOf(THREE.MeshPhongMaterial);
  });

  it('reports a missing material library and textures', async () => {
    const r = await loadObj({ name: 'parts.obj', data: OBJ });
    expect(r.missing).toEqual(['parts.mtl']);
    const noTexture = await loadObj(files().slice(0, 2));
    expect(noTexture.missing).toEqual(['checker.png']);
  });

  it('reads text, zips and a real model', async () => {
    const text = 'v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\n';
    expect((await loadObj(text)).stats.triangles).toBe(1);
    const zip = zipSync({ 'model/parts.obj': new TextEncoder().encode(OBJ), 'model/parts.mtl': new TextEncoder().encode(MTL), 'model/textures/checker.png': PNG });
    expect((await loadObj({ name: 'model.zip', data: zip })).stats.textures).toBe(1);
    expect((await loadObj(sample('tree.obj'))).stats.triangles).toBe(760);
  });

  it('turns Z-up models and scales them', async () => {
    const r = await loadObj('v 0 0 0\nv 1 0 0\nv 0 0 2\nf 1 2 3\n', { upAxis: 'z', unitScale: 0.001 });
    const size = new THREE.Box3().setFromObject(r.group).getSize(new THREE.Vector3());
    expect(size.y).toBeCloseTo(0.002);
  });

  it('refuses files that are not OBJ', async () => {
    await expect(loadObj('hello world')).rejects.toThrow(ObjImportError);
  });
});
