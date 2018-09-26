## Brush Tool {#base-brush-tool}

The `BaseBrushTool` is an extension of `BaseTool` for tools which edit the `brush` `colormap` data, used for displaying segmentations. The segmentation masks will be rendered if at least one tool which `extend`s `BaseBrushTool` is enabled on the cornerstone element.

- Abstract Methods
  - renderBrush
  - \_paint
