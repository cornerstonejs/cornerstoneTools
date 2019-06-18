import { BaseSegmentationTool } from '../base';
import { fill } from '../../util/segmentation/operations';
import { segCircleFillInsideCursor } from '../cursors';

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
        FILL_INSIDE: _fillInsideStrategy,
        FILL_OUTSIDE: _fillOutsideStrategy,
        ERASE_OUTSIDE: _eraseOutsideStrategy,
        ERASE_INSIDE: _eraseInsideStrategy,
        default: _fillInsideStrategy,
      },
      defaultStrategy: 'default',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: segCircleFillInsideCursor,
      mixins: ['circleSegmentationMixin'],
    };

    super(props, defaultProps);
  }
}

function _fillInsideStrategy(evt) {
  fill('Circle', 'FILL_INSIDE', evt);
}

function _fillOutsideStrategy(evt) {
  fill('Circle', 'FILL_OUTSIDE', evt);
}

function _eraseOutsideStrategy(evt) {
  fill('Circle', 'ERASE_OUTSIDE', evt);
}

function _eraseInsideStrategy(evt) {
  fill('Circle', 'ERASE_INSIDE', evt);
}
