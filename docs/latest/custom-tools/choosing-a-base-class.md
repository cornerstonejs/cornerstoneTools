## Choosing A Base Class {#choosing-a-base-class}

There are 3 base classes to choose from when building a tool:

### BaseTool

The `BaseTool` is the fundamental base class, with just the functionality required to function within the `cornerstoneTools` framework. This is the base class to choose if the tool you wish to create won't have its own annotation data (.e.g `MagnifyTool`), or only interacts with a different tool's data (e.g. `FreehandMouseSculpterTool`). The other two base classes `BaseAnnotationTool` and `BaseBrushTool` both inherit from `BaseTool`.

### BaseAnnotationTool

The `BaseAnnotationTool` inherits from `BaseTool`, and is intended for any tool that will create/modify and display its own annotation data on the canvas (e.g. `LengthTool`).

### BaseBrushTool

The `BaseBrushTool` inherits from `BaseTool` and is intended specifically for tools that want to create/modify/delete segmentation data (e.g. `BrushTool`). Potential subclasses could include adaptive brush tools, or region growing tools that require a seed area to be drawn.
