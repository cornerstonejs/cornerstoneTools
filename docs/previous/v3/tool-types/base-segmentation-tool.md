## Base Segmentation Tool {#base-segmentation-tool}

The `BaseSegmentationTool` is an extension of `BaseTool` for Tools which edit the `labelmap` data, used for displaying segmentation. 
Unlike subclasses of `BaseAnnotationTool`, subclasses of `BaseSegmentationTool` don't manage the rendering of their own data. 
Rendering of the segmentation masks is centralized at `src/eventListeners/onImageRenderedBrushEventHandler.js`. 
If at least one subclass of `BaseSegmentationTool` is either `Active`, `Enabled` or `Passive`, the segmentation data is rendered to the canvas.

- Abstract Methods:
  - `_changeCursor`
