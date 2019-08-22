## Base Segmentation Tool {#base-segmentation-tool}

The `BaseSegmentationTool` is an extension of `BaseTool` for Tools which edit the segmentation module's `Labelmap3D` data by drawing a shape on the canvas and applying a strategy to that shape. Used for creating and editing segmentations.
Unlike subclasses of `BaseAnnotationTool`, subclasses of `BaseSegmentationTool` don't manage the rendering of their own data.
Rendering of the segmentation masks is centralized at `src/eventListeners/onImageRenderedBrushEventHandler.js`.
If at least one subclass of `BaseBrushTool` or `BaseSegmentationTool` is either `Active`, `Enabled` or `Passive`, the segmentation data is rendered to the canvas.

- Abstract Methods:
  - `_startOutliningRegion` - Initialises the deliniation. Implemented by a segmentation mixin, called by `postTouchStartCallback`, `postMouseDownCallback` and `mouseClickCallback`.
  - `_setHandlesAndUpdate` - Adds UI deliniation data to be rendered to the canvas during tool usage. Implemented by a segmentation mixin, called by `touchDragCallback`, `mouseDragCallback` and `mouseMoveCallback`.
  - `_applyStrategy` - Applies the active segmentation strategy with the deliniation as input. Implemented by a segmentation mixin, called by `touchEndCallback` and `mouseUpCallback`.
- Virtual Methods:
  - `changeStrategy` - Changes the active strategy.
  - `changeCursor` - Changes the active cursor.

`SegmentationTool`s are comprised of a few components:

- A [Segmentation Mixin](tool-mixins/index.md#segmentation-tools) - A mixin which adds an deliniation mechanism which allows the user to input a target region. The mixin then calls the `activeStrategy` function with this deliniation data as its input.
- One or more `strategies` to be implemented.
- A set of `cursors` for `strategies`.

```js
/**
 * @public
 * @class CircleScissorsTool
 * @memberof Tools
 * @classdesc Tool for slicing brush pixel data within a rectangle shape
 * @extends Tools.Base.BaseSegmentationTool
 */
export default class CircleScissorsTool extends BaseSegmentationTool {
  /** @inheritdoc */
  constructor(props = {}) {
    const defaultProps = {
      name: 'CircleScissors',
      configuration: {
        referencedToolData: 'segmentation',
      },
      // A list of strategies, the active strategy is applied
      strategies: {
        FILL_INSIDE: fillInsideCircle,
        FILL_OUTSIDE: fillOutsideCircle,
        ERASE_OUTSIDE: eraseOutsideCircle,
        ERASE_INSIDE: eraseInsideCircle,
      },
      //
      cursors: {
        FILL_INSIDE: segCircleFillInsideCursor,
        FILL_OUTSIDE: segCircleFillOutsideCursor,
        ERASE_OUTSIDE: segCircleEraseOutsideCursor,
        ERASE_INSIDE: segCircleEraseInsideCursor,
      },
      defaultStrategy: 'FILL_INSIDE',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: segCircleFillInsideCursor,
      mixins: ['circleSegmentationMixin'],
    };

    super(props, defaultProps);
  }
}
```
