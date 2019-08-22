## Base Segmentation Tool {#base-segmentation-tool}

The `BaseSegmentationTool` is an extension of `BaseTool` for Tools which edit the segmentation module's `Labelmap3D` data by drawing a shape on the canvas and applying a strategy to that shape. Used for creating and editing segmentations.

Unlike subclasses of `BaseAnnotationTool`, subclasses of `BaseSegmentationTool` don't manage the rendering of their own data.
Rendering of the segmentation masks is centralized at `src/eventListeners/onImageRenderedBrushEventHandler.js`.
If at least one subclass of `BaseBrushTool` or `BaseSegmentationTool` is either `Active`, `Enabled` or `Passive`, the segmentation data is rendered to the canvas.

### Abstract Methods:

- \_applyStrategy(evt) - Applies the active segmentation strategy with the deliniation as input. Implemented by a [segmentation mixin](../tool-mixins/index.md#segmentation-mixins).

### Virtual Methods:

- `changeStrategy` - Changes the active strategy. Default implementation changes the `activeStrategy` and the `svgCursor`.
- `changeCursor` - Changes the active cursor.

### Anatomy

`SegmentationTool`s are comprised of a few components:

- A [Segmentation Mixin](../tool-mixins/index.md#segmentation-mixins) - A mixin which adds a deliniation mechanism, which allows the user to input a target region.
- One or more `strategies` to be called by thes segmentation mixin's `_applyStrategy` method.
- A set of `cursors` for `strategies`.

### Example

Below is an example of SegementationTool:

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
      strategies: {
        FILL_INSIDE: fillInsideCircle,
        FILL_OUTSIDE: fillOutsideCircle,
        ERASE_OUTSIDE: eraseOutsideCircle,
        ERASE_INSIDE: eraseInsideCircle,
      },
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

Lets analyse the components unique to segmentation tools:

#### Strategies

```js
// ...
strategies: {
  FILL_INSIDE: fillInsideCircle,
  FILL_OUTSIDE: fillOutsideCircle,
  ERASE_OUTSIDE: eraseOutsideCircle,
  ERASE_INSIDE: eraseInsideCircle,
},
// ...
defaultStrategy: 'FILL_INSIDE',
// ...
```

The `strategies` prop defines a set of operations that can be executed at the end of deliniation. The `activateStrategy` is initialised by the `defaultStrategy` prop. The tool's `activeStrategy` can be changed by the `BaseSegmentationTool`'s `changeStrategy` method.

#### Cursors

```js
// ...
cursors: {
  FILL_INSIDE: segCircleFillInsideCursor,
  FILL_OUTSIDE: segCircleFillOutsideCursor,
  ERASE_OUTSIDE: segCircleEraseOutsideCursor,
  ERASE_INSIDE: segCircleEraseInsideCursor,
},
// ...
svgCursor: segCircleFillInsideCursor,
// ...
```

The `cursors` prop defines a set of cursors with the same keys as your set of `strategies`. The `svgCursor` will be changed when `changeStrategy` is called. The `svgCursor` prop sets the default for the `svgCursor`.

#### Segmentation Mixins

```js
// ...
mixins: ['circleSegmentationMixin'];
// ...
```

The `mixins` prop can be used as with `BaseTool`, but at least one [segmentation mixin](../tool-mixins/index.md#segmentation-mixins) must be used. The job the segmentation mixin is to take user input through some means, implement `_applyStrategy`, and call the `strategy` with appropriate input. Segmentation mixins are described more [here](../tool-mixins/index.md#segmentation-mixins)
