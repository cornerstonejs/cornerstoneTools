## Segmentation Mixins {#segmentation-mixins}

[Segmentation Tools](../tool-types/index.md#base-segmentation-tool) require a segmentation mixin to function. The role of a segmentation mixin is to provide a user input mechanism, which generates an `operationData` object which it attaches to the cornerstone event and sends to the tool's active strategy.

Examples of segmentation mixins could be:

- User draws a shape as input.
- User clicks one or more seed points as input on one frame.
- User clicks at the top and bottom of a region of interest (on different frames) in an axial series.

Although segmentation tools may have very specific uses (e.g. the last example above could be used as seeds for an AI-powered spine segmentation, by providing the spine's extent), segmentation mixins themselves are intended to be reusable in many contexts. For example the `freehandSegmentationMixin` is used in the core library in both the `FreehandScissorsTool` and `CorrectionScissorsTool`s. Other than their intended use case, segmentation mixins are functionally just mixins in the context of `cornerstoneTools`, so can be [injected by plugins like any other mixin](../third-party-functionality/index.md).

As the input mechanisms can vary from simple to complex, segmentation mixins only have one required method, `_applyStrategy`.

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
  initializeSegmentationMixin: _resetHandles,
  renderToolData,
  _resetHandles,
  _applyStrategy,
};
```

This mixin implements a "drag-to-define-a-circle" deliniation mechanism, and as such plugs its methods into `BaseTool` API for dealing with appropriate interactions such as down/touch, drag and release for both mouse and touch interactions.

The `renderToolData` renders the circle to the canvas whilst dilineation is in process. `BaseSegmentationTool` calls a mixin's `initializeSegmentationMixin` method in its constructor, if present.

The `_applyStrategy` calls the Tool's `activeStrategy` method with an augmented cornerstone event with an additional `operationData` property:

```js
//src/mixins/segmentation/circleSegmentationMixin.js

// ...
evt.operationData = {
  points,
  pixelData,
  segmentIndex: labelmap3D.activeSegmentIndex,
  segmentationMixinType: `circleSegmentationMixin`,
};

this.applyActiveStrategy(evt);
// ...
```

Here the `operationData` contains information about the users input. The `segmentationMixinType` property just defines a key that tells the strategy what sort of `operationData` it is recieving, so that it knows what to process, or can throw if it can't process operations from that mixin. E.g.:

```js
//src/util/segmentation/operations/fillInsideCircle.js

// ...
const { operationData } = evt;
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
evt.operationData = {
  points,
  pixelData,
  segmentIndex: labelmap3D.activeSegmentIndex,
  segmentationMixinType: `circleSegmentationMixin`,
};
```

Where:

- points - An object with two points `start` and `end` containing the (`x`,`y`) coordinates of the centre of the circle and a point on its edge.
- `pixelData` - The `pixelData` of the `Labelmap2D` that corresponds with the image.
- The `segmentIndex` to apply the operation to.
- `segmentationMixinType` - The mixin identifier.

#### freehandSegmentationMixin

The `freehandSegmentationMixin` allows the user to draw a freehand polygon on a single frame of a series via a touch/mouse drag. On mouse up/touch end, the mixin calls the Tool's `activeStrategy` with the following `operationData`:

```js
evt.operationData = {
  points,
  pixelData,
  segmentIndex: labelmap3D.activeSegmentIndex,
  segmentationMixinType: `circleSegmentationMixin`,
};
```

Where:

- points - An array of points containing the (`x`,`y`) coordinates of the nodes along its points.
- `pixelData` - The `pixelData` of the `Labelmap2D` that corresponds with the image.
- The `segmentIndex` to apply the operation to.
- `segmentationMixinType` - The mixin identifier.

The `freehandSegmentationMixin`'s `renderTooldata` method connects the first and last point whilst drawing, signifying a closed polygon to the user. If you wish to just display the open polyline for a Tool when deliniating, just add the `freehandPolylineRenderOverride` mixin after the `freehandSegmentationMixin`:

```js
// ...
mixins: ['freehandSegmentationMixin', 'freehandPolylineRenderOverride'],
// ...
```

#### rectangleSegmentationMixin

The `rectangleSegmentationMixin` allows the user to draw a rectangle on a single frame of a series via a touch/mouse drag. On mouse up/touch end, the mixin calls the Tool's `activeStrategy` with the following `operationData`:

```js
evt.operationData = {
  points,
  pixelData,
  segmentIndex: labelmap3D.activeSegmentIndex,
  segmentationMixinType: `circleSegmentationMixin`,
};
```

Where:

- points - An array with two points containing the (`x`,`y`) coordinates of the top left and the bottom right of the rectangle.
- `pixelData` - The `pixelData` of the `Labelmap2D` that corresponds with the image.
- The `segmentIndex` to apply the operation to.
- `segmentationMixinType` - The mixin identifier.
