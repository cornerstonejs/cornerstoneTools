import { BaseSegmentationTool } from '../base';
import {
  fillInsideCircle,
  fillOutsideCircle,
  eraseOutsideCircle,
  eraseInsideCircle,
} from '../../util/segmentation/operations';
import { segCircleFillInsideCursor } from '../cursors';
import { getCursor } from './../../util/segmentation';

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
      defaultStrategy: 'FILL_INSIDE',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: segCircleFillInsideCursor,
      mixins: ['circleSegmentationMixin'],
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
    return getCursor(`CircleScissors`, strategy);
  }
}
