import { BaseSegmentationTool } from '../base';
import {
  fillInsideBoundingBox,
  fillOutsideRectangle,
  eraseOutsideRectangle,
  eraseInsideBoundingBox,
} from '../../util/segmentation/operations';
import { segRectangleFillInsideCursor } from '../cursors';
import { getCursor } from './../../util/segmentation';

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
        FILL_INSIDE: fillInsideBoundingBox,
        FILL_OUTSIDE: fillOutsideRectangle,
        ERASE_OUTSIDE: eraseOutsideRectangle,
        ERASE_INSIDE: eraseInsideBoundingBox,
      },
      defaultStrategy: 'FILL_INSIDE',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: segRectangleFillInsideCursor,
      mixins: ['rectangleSegmentationMixin'],
    };

    super(props, defaultProps);
  }

  /**
   * Gets The cursor according to strategy.
   *
   * @param  {string} strategy the operation strategy.
   * @returns {MouseCursor}
   */
  _getCursor(strategy) {
    return getCursor(`RectangleScissors`, strategy);
  }
}
