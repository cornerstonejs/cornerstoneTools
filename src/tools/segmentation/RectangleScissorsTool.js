import { BaseSegmentationTool } from '../base';
import { fill } from '../../util/segmentation/operations';
import { segRectangleFillInsideCursor } from '../cursors';

/**
 * @public
 * @class RectangleScissorsTool
 * @memberof Tools
 * @classdesc Tool for slicing brush pixel data within a rectangle shape
 * @extends Tools.Base.BaseSegmentationTool
 */
export default class RectangleScissorsTool extends BaseSegmentationTool {
  /** @inheritdoc */
  constructor(props = {}) {
    const defaultProps = {
      name: 'RectangleScissors',
      configuration: {
        referencedToolData: 'segmentation',
      },
      strategies: {
        FILL_INSIDE: _fillInsideStrategy,
        FILL_OUTSIDE: _fillOutsideStrategy,
        ERASE_OUTSIDE: _eraseOutsideStrategy,
        ERASE_INSIDE: _eraseInsideStrategy,
        default: _fillInsideStrategy,
      },
      defaultStrategy: 'default',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: segRectangleFillInsideCursor,
      mixins: ['rectangleSegmentationMixin'],
    };

    super(props, defaultProps);
  }
}

function _fillInsideStrategy(evt) {
  fill('Rectangle', 'FILL_INSIDE', evt);
}

function _fillOutsideStrategy(evt) {
  fill('Rectangle', 'FILL_OUTSIDE', evt);
}

function _eraseOutsideStrategy(evt) {
  fill('Rectangle', 'ERASE_OUTSIDE', evt);
}

function _eraseInsideStrategy(evt) {
  fill('Rectangle', 'ERASE_INSIDE', evt);
}
