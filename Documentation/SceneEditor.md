# Using it in SceneEditor

[SceneEditor](https://github.com/VJigouline/SceneEditor) opens `.obj` and `.mtl` files and textures with mc-obj-import. Drop the `.obj` file together with its `.mtl` files and textures, or their folder, or a zip of them. With **Open files**, choose them together.

The model is added to the scene, named after its file, and the view is refitted. A file that can't be read gives a **Failure** message, and the scene is unaffected. Warnings go to the browser console.

The model comes in metres with Y up, like the other formats. Its materials can be edited on the Materials tab like any other.
