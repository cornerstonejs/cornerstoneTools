## Base Brush Tool {#base-brush-tool}

The `BaseBrushTool` is an extension of `BaseTool` for Tools which edit the segmentation module's `Labelmap3D` data by painting on the canvas. Used for creating and editing segmentations.

Unlike subclasses of `BaseAnnotationTool`, subclasses of `BaseBrushTool` don't manage the rendering of their own data. Rendering of the segmentation masks is centralized at `src/eventListeners/onImageRenderedBrushEventHandler.js`. If a `Labelmap2D` object exists on a displayed cornerstone image, and either of the [segmentation module's](../modules/index.md#segmentation) `renderFill` or `renderOutline` configuration options are true.

- Abstract Methods:
  - `renderBrush`
  - `_paint`
- Virtual Methods:
  - `mouseDragCallback`
  - `preMouseDownCallback`
  - `_startPainting`
  - `_endPainting`
