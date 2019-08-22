import { BaseSegmentationTool } from '../base';
import {
  fillInsideCircle,
  fillOutsideCircle,
  eraseOutsideCircle,
  eraseInsideCircle,
} from '../../util/segmentation/operations';
import {
  segCircleFillInsideCursor,
  segCircleFillOutsideCursor,
  segCircleEraseOutsideCursor,
  segCircleEraseInsideCursor,
} from '../cursors';

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
