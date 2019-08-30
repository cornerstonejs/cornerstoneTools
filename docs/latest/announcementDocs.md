# CornerstoneTools 4.0 Beta

I'm proud to announce the Beta for a new version of CornerstoneTools! :tada:

The aim of the this version was to improve the support for both interacting with and storing segmentations

Features

// TODO!

- BaseTool Changes
  - applyActiveStrategy
    - The strategy is now `call`ed by the tool, and `this.configruation` is no longer passed. You now have the correct `this`, and can access configuration, amongst other tool properties from within the strategy method.
    - Optionally, `applyActiveStrategy` can be passed an `operationData` object, which may contain data not present in the cornerstone event (`evt`), which is needed to apply the strategy.
- SegmentationTools
