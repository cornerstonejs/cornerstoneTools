## Segmentation API {#segmentation-API}

The segmentation API mixin adds a wrapper around the `segmentationModule` and provides a set of helper functions to all tools that interact with labelmaps, by being implemented in both `BaseBrushTool` and `BaseSegmentationTool`.

It contains getters and setters for the following segmentation configuration:

- `activeLabelmapIndex`
- `fillAlpha`
- `fillAlphaInactive`
- `outlineAlpha`
- `outlineAlphaInactive`

As well as helpers `nextSegment` and `previousSegment`, which increment or decrement the `activeSegmentIndex` on the active label map of the element the tool is on.

Each of these helpers also updates all enabled elements when configuration is set, such that the visualisation of the labelmap reflects the changes.
