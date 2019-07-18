import { freehandFillInsideCursor } from '../cursors';
import { fill } from '../../util/segmentation';
import { BaseSegmentationTool } from '../base';

/**
 * @public
 * @class FreehandScissorsTool
 * @memberof Tools
 * @classdesc Tool for slicing brush pixel data
 * @extends Tools.Base.BaseSegmentationTool
 */
export default class FreehandScissorsTool extends BaseSegmentationTool {
  /** @inheritdoc */
  constructor(props = {}) {
    const defaultProps = {
      name: 'FreehandScissors',
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
      svgCursor: freehandFillInsideCursor,
      mixins: ['freehandSegmentationMixin'],
    };

    super(props, defaultProps);
  }
}

function _fillInsideStrategy(evt) {
  fill('Freehand', 'FILL_INSIDE', evt);
}

function _fillOutsideStrategy(evt) {
  fill('Freehand', 'FILL_OUTSIDE', evt);
}

function _eraseOutsideStrategy(evt) {
  fill('Freehand', 'ERASE_OUTSIDE', evt);
}

function _eraseInsideStrategy(evt) {
  fill('Freehand', 'ERASE_INSIDE', evt);
}
