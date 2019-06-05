## Base Annotation Tool {#base-annotation-tool}

The `BaseAnnotationTool` is an extension of `BaseTool` for Tools that create and manipulate annotation data.

- Abstract Methods:
  - `createNewMeasurement`
  - `pointNearTool`
  - `distanceFromPoint`
  - `renderToolData`
- Virtual Methods:
  - `mouseMoveCallback`
  - `handleSelectedCallback`
  - `toolSelectedCallback`
  - `updateCachedStats`
