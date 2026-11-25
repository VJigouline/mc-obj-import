# Formats and support

mc-obj-import reads Wavefront OBJ with three.js's OBJLoader and MTLLoader.

## What is read

- Vertices, texture coordinates, normals and vertex colours; faces of any size, lines (`l`) and points (`p`).
- Objects (`o`) and groups (`g`) as separate meshes, and smoothing groups.
- Material libraries (`mtllib`, several allowed): colours, shininess, transparency, and diffuse, bump, normal and opacity maps.
- Materials as MeshStandardMaterial (roughness from shininess), or as MeshPhongMaterial with `materialType: 'phong'`.

## Orientation and units

OBJ has no units or up axis. The model is left as it is (Y up, one unit a metre) unless you pass `upAxis: 'z'` or `unitScale`.

## Limits

Free-form curves and surfaces (`curv`, `surf`) are not read.
