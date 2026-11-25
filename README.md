# mc-obj-import

A Wavefront OBJ importer for [three.js](https://threejs.org/), written in TypeScript. It reads OBJ models with their MTL material libraries and textures, and builds a three.js group of meshes, lines and points. It was made for [SceneEditor](https://github.com/VJigouline/SceneEditor), and works in any three.js application.

```ts
import { loadObj } from 'mc-obj-import';

const result = await loadObj(input.files);   // the .obj, .mtl and images
scene.add(result.group);
console.log(result.warnings);       // anything that couldn't be read
```

## What it reads

- Vertices, texture coordinates, normals and vertex colours; faces of any size, lines (`l`) and points (`p`).
- Objects (`o`) and groups (`g`) as separate meshes, and smoothing groups.
- Material libraries (`mtllib`, several allowed): colours, shininess, transparency, and diffuse, bump, normal and opacity maps.
- Materials as MeshStandardMaterial (roughness from shininess), or as MeshPhongMaterial with `materialType: 'phong'`.

Free-form curves and surfaces (`curv`, `surf`) are not read. See [Formats and support](Documentation/Support.md) for the details.

## Install

The package is not on the npm registry. Install it from GitHub:

```sh
npm install github:VJigouline/mc-obj-import
```

`three` (r160 or later) is a peer dependency. The package builds itself on install.

## Documentation

- [Getting started](Documentation/GettingStarted.md)
- [API](Documentation/API.md)
- [Formats and support](Documentation/Support.md)
- [Using it in SceneEditor](Documentation/SceneEditor.md)

## Development

```sh
npm install
npm test           # unit tests, with Vitest
npm run typecheck
npm run build      # dist/
```

The tests load real Wavefront OBJ files, kept in [`tests/samples`](tests/samples/README.md) with their licences. It needs Node.js 22 or later.

## Licence

[MIT](LICENSE)
