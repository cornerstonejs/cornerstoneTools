## Base Brush Tool {#base-brush-tool}

The `BaseBrushTool` is an extension of `BaseTool` for Tools which edit the segmentation module's `Labelmap3D` data by painting on the canvas. Used for creating and editing segmentations.

Unlike subclasses of `BaseAnnotationTool`, subclasses of `BaseBrushTool` don't manage the rendering of their own data. Rendering of the segmentation masks is centralized at `src/eventListeners/onImageRenderedBrushEventHandler.js`. If at least one subclass of `BaseBrushTool` or `BaseSegmentationTool` is either `Active`, `Enabled` or `Passive`, the segmentation data is rendered to the canvas.

- Abstract Methods:
  - `renderBrush`
  - `_paint`
- Virtual Methods:
  - `mouseDragCallback`
  - `preMouseDownCallback`
  - `_startPainting`
  - `_endPainting`
