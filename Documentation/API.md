# API

## `loadObj(input, options?)`

Reads `.obj`, with its `.mtl` material libraries and textures and returns a promise of a `ObjLoadResult`.

`input` is the file's contents (`ArrayBuffer`, `Uint8Array` or string), a browser `File`, `{ name, data }`, or an iterable of files for a model in several files. Zip archives among them are opened.

It throws `ObjImportError` for input that isn't Wavefront OBJ.

### Options

| Option | Default | Meaning |
| --- | --- | --- |
| `main` | the first .obj file | The .obj file to open, if several are given. |
| `materialType` | 'standard' | `'standard'` makes MeshStandardMaterial; `'phong'` keeps MTLLoader's MeshPhongMaterial. |
| `upAxis` | 'y' | `'z'` turns a Z-up model to three.js's Y up. |
| `unitScale` | 1 | Metres per OBJ unit. |

### `ObjLoadResult`

| Field | Type | Meaning |
| --- | --- | --- |
| `group` | `THREE.Group` | The model. |
| `materialLibraries` | `string[]` | The material libraries the file names, found or not. |
| `missing` | `string[]` | Material libraries and textures that were not given. |
| `warnings` | `string[]` | Problems that didn't stop the import. |
| `stats` | object | Counts of meshes, triangles and the like. |

See the package's `index.d.ts` for every exported type and helper.
