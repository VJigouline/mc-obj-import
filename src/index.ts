import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { countModel, FileManager, ImportFiles, orient, toStandardMaterials, type ImportInput, type ImportStats } from './common.js';

export { ImportFiles, FileManager, toStandardMaterials, countModel } from './common.js';
export type { ImportInput, ImportFile, ImportData, ImportStats } from './common.js';

export interface ObjOptions {
  /** The .obj file to open, if several are given. By default, the first. */
  main?: string;
  /** standard (the default) turns the MTL materials into MeshStandardMaterial; phong keeps MeshPhongMaterial. */
  materialType?: 'standard' | 'phong';
  /** OBJ has no up axis; most files are Y up (the default). Use 'z' for Z-up files, such as many from CAD. */
  upAxis?: 'y' | 'z';
  /** Metres per OBJ unit. OBJ has no units; the default, 1, leaves the model as it is. */
  unitScale?: number;
}

export interface ObjLoadResult {
  /** The model: a group named after the file, holding the OBJ's objects. */
  group: THREE.Group;
  /** Material libraries (mtllib) the file names, found or not. */
  materialLibraries: string[];
  /** Files the model refers to that were not given: material libraries and textures. */
  missing: string[];
  warnings: string[];
  stats: ImportStats;
}

export class ObjImportError extends Error {
  override name = 'ObjImportError';
}

/**
 * Reads a Wavefront OBJ file with its MTL material libraries and textures. Pass the .obj file's
 * text or bytes, or the files together: the .obj, its .mtl files and images, loose or in a zip.
 */
export async function loadObj(input: ImportInput, options: ObjOptions = {}): Promise<ObjLoadResult> {
  const files = await ImportFiles.from(input, 'model.obj');
  const main = files.main(['obj'], options.main);
  if (!main) throw new ObjImportError('There is no .obj file to open');
  const text = files.text(main);
  if (!/^\s*(v|vn|vt|f|o|g|mtllib|usemtl|l|p)\s/m.test(text)) throw new ObjImportError(`${main.name} is not an OBJ file`);

  const fm = new FileManager(files);
  const warnings: string[] = [];
  const loader = new OBJLoader(fm.manager);
  const libraries = [...text.matchAll(/^\s*mtllib\s+(.+?)\s*$/gm)].flatMap((m) => m[1]!.split(/\s+(?=\S+\.mtl\b)/i));
  const missing = new Set<string>();
  for (const name of libraries) {
    const mtl = files.find(name);
    if (!mtl) {
      missing.add(name.replace(/\\/g, '/').split('/').pop()!);
      continue;
    }
    const creator = new MTLLoader(fm.manager).parse(files.text(mtl), '');
    creator.preload();
    // Several libraries: the materials of later ones are added to the first's.
    const current = (loader as unknown as { materials: MTLLoader.MaterialCreator | null }).materials;
    if (current) for (const [k, v] of Object.entries(creator.materials)) current.materials[k] = v;
    else loader.setMaterials(creator);
  }
  const model = loader.parse(text);
  await fm.done();
  for (const m of fm.missing) missing.add(m);
  fm.dispose();

  // Usemtl names that no library defines get the loader's default grey material.
  const defined = new Set(Object.keys((loader as unknown as { materials: MTLLoader.MaterialCreator | null }).materials?.materials ?? {}));
  const used = new Set([...text.matchAll(/^\s*usemtl\s+(.+?)\s*$/gm)].map((m) => m[1]!));
  const undefinedMaterials = [...used].filter((u) => !defined.has(u));
  if (undefinedMaterials.length && libraries.length) warnings.push(`Materials not found in the material libraries: ${undefinedMaterials.slice(0, 10).join(', ')}`);

  if ((options.materialType ?? 'standard') === 'standard') toStandardMaterials(model);
  const name = main.name.replace(/\\/g, '/').split('/').pop()!.replace(/\.obj$/i, '');
  model.name = name;
  const group = orient(model, name, options.upAxis === 'z', options.unitScale ?? 1);
  if (missing.size) warnings.push(`Not found: ${[...missing].join(', ')}`);
  return { group, materialLibraries: libraries, missing: [...missing], warnings, stats: countModel(group) };
}
