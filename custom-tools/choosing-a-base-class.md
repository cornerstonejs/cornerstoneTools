## Choosing A Base Class {#choosing-a-base-class}

There are 3 base classes to choose from when building a tool:

### [BaseTool](../tool-types/index.md#base-tool)

The `BaseTool` is the fundamental base class, with just the functionality required to function within the Cornerstone Tools framework. This is the base class to choose if the Tool you wish to create won't have its own annotation data (.e.g `MagnifyTool`), or only interacts with a different Tool's data (e.g. `FreehandRoiSculptorTool`). The other two base classes `BaseAnnotationTool` and `BaseBrushTool` both inherit from `BaseTool`.

A `BaseTool` is also the Tool type you should derive from when making a tool that interacts with the labelmap data, and isn't a brush. These are dubbed "Segmentation Tools".

### [BaseAnnotationTool](../tool-types/index.md#base-annotation-tool)

The `BaseAnnotationTool` inherits from `BaseTool`, and is intended for any Tool that will create/modify and display its own annotation data on the canvas (e.g. `LengthTool`).

### [BaseBrushTool](../tool-types/index.md#base-brush-tool)

The `BaseBrushTool` inherits from `BaseTool` and is intended specifically for Tools that want to create/modify/delete segmentation data (e.g. `BrushTool`). Potential subclasses could include adaptive brush Tools, or region growing Tools that require a seed area to be drawn.
