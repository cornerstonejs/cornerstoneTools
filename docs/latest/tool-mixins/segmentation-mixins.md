## Segmentation Mixins {#segmentation-mixins}

["Segmentation Tools"](../tool-types/index.md#segmentation-tool) are `BaseTool`s that implement a segmentation mixin.

The role of a segmentation mixin is to provide a delineation mechanism, which generates an `operationData` object which is passed to the active strategy alongside the cornerstone event.

Examples of segmentation mixins could be:

- User draws a shape as input.
- User clicks one or more seed points as input on one frame.
- User clicks at the top and bottom of a region of interest (on different frames) in an axial series.

Although segmentation tools may have very specific uses (e.g. the last example above could be used as seeds for an AI-powered spine segmentation, by providing the spine's extent), segmentation mixins themselves are intended to be reusable in many contexts. Other than their intended use case, segmentation mixins are functionally just mixins in the context of `cornerstoneTools`, so can be [injected by plugins like any other mixin](../third-party-functionality/index.md).

As the delineation mechanisms can vary from simple to complex, the only requirement of a segmentation mixin is that it must call `BaseTool`'s `this.applyActiveStrategy(evt, operationData)` with the `operationData` it produces at the end of the delination cycle.

Taking the `circleSegmentationMixin` as an example:

```js
/**
 * @mixin circleSegmentationMixin - Segmentation operations for circles.
 * @memberof Mixins
 */
export default {
  postTouchStartCallback: _startOutliningRegion,
  postMouseDownCallback: _startOutliningRegion,
  mouseClickCallback: _startOutliningRegion,
  touchDragCallback: _setHandlesAndUpdate,
  mouseDragCallback: _setHandlesAndUpdate,
  mouseMoveCallback: _setHandlesAndUpdate,
  touchEndCallback: _applyStrategy,
  mouseUpCallback: _applyStrategy,
  initializeMixin: _resetHandles,
  renderToolData,
};
```

This mixin implements a "drag-to-define-a-circle" delineation mechanism, and as such plugs its methods into `BaseTool` API for dealing with appropriate user input such as down/touch, drag and release for both mouse and touch interactions.

The `renderToolData` function renders the circle to the canvas whilst dilineation is in process.

The `_applyStrategy` function here calls `BaseTool`'s `applyActiveStrategy` method:

```js
//src/mixins/segmentation/circleSegmentationMixin.js

// ...
const operationData = {
  points,
  pixelData,
  segmentIndex: labelmap3D.activeSegmentIndex,
  segmentationMixinType: `circleSegmentationMixin`,
};

this.applyActiveStrategy(evt, operationData);
// ...
```

Here the `operationData` contains information about the delineation. The `segmentationMixinType` property just defines a key that tells the strategy what sort of `operationData` it is recieving, so that it knows what to process, or can throw if it can't process operations from that mixin. E.g.:

```js
//src/util/segmentation/operations/fillInsideCircle.js

// ...
if (operationData.segmentationMixinType !== `circleSegmentationMixin`) {
  logger.error(
    `fillInsideCircle operation requires circleSegmentationMixin operationData, recieved ${
      operationData.segmentationMixinType
    }`
  );

  return;
}
// ...
```

### Core Segmentation Mixins

Here are the segmentation mixins present in the core `cornerstoneTools` library. They power the various scissor and correction tools.

#### circleSegmentationMixin

The `circleSegmentationMixin` allows the user to draw a circle on a single frame of a series via a touch/mouse drag. On mouse up/touch end, the mixin calls the Tool's `activeStrategy` with the following `operationData`:

```js
const operationData = {
  points,
  pixelData,
  segmentIndex: labelmap3D.activeSegmentIndex,
  segmentationMixinType: `circleSegmentationMixin`,
};
```

Where:

- `points` - An object with two points `start` and `end` containing the (`x`,`y`) coordinates of the centre of the circle and a point on its edge.
- `pixelData` - The `pixelData` of the `Labelmap2D` that corresponds with the image.
- The `segmentIndex` to apply the operation to.
- `segmentationMixinType` - The mixin identifier.

#### freehandSegmentationMixin / polylineSegmentationMixin

The `freehandSegmentationMixin` allows the user to draw a freehand polygon on a single frame of a series via a touch/mouse drag. On mouse up/touch end, the mixin calls the Tool's `activeStrategy` with the following `operationData`:

```js
const operationData = {
  points,
  pixelData,
  segmentIndex: labelmap3D.activeSegmentIndex,
  segmentationMixinType: `circleSegmentationMixin`,
};
```

Where:

- `points` - An array of points containing the (`x`,`y`) coordinates of the nodes along its points.
- `pixelData` - The `pixelData` of the `Labelmap2D` that corresponds with the image.
- The `segmentIndex` to apply the operation to.
- `segmentationMixinType` - The mixin identifier.

The `freehandSegmentationMixin`'s `renderTooldata` method connects the first and last point whilst drawing, signifying a closed polygon to the user. If you wish to display just the open polyline for a Tool whilst deliniating, use the `polylineSegmentationMixin` instead, which implements the `freehandSegmentationMixin` but overrides its `renderToolData` method to display just the line.

#### rectangleSegmentationMixin

The `rectangleSegmentationMixin` allows the user to draw a rectangle on a single frame of a series via a touch/mouse drag. On mouse up/touch end, the mixin calls the Tool's `activeStrategy` with the following `operationData`:

```js
const operationData = {
  points,
  pixelData,
  segmentIndex: labelmap3D.activeSegmentIndex,
  segmentationMixinType: `circleSegmentationMixin`,
};
```

Where:

- `points` - An array with two points containing the (`x`,`y`) coordinates of the top left and the bottom right of the rectangle.
- `pixelData` - The `pixelData` of the `Labelmap2D` that corresponds with the image.
- The `segmentIndex` to apply the operation to.
- `segmentationMixinType` - The mixin identifier.
