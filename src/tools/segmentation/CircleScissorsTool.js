import { BaseTool } from '../base';
import {
  fillInsideCircle,
  fillOutsideCircle,
  eraseOutsideCircle,
  eraseInsideCircle,
} from './strategies';
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
 * @classdesc Tool for manipulating labelmap data by drawing a circle.
 * @extends Tools.Base.BaseTool
 */
export default class CircleScissorsTool extends BaseTool {
  /** @inheritdoc */
  constructor(props = {}) {
    const defaultProps = {
      name: 'CircleScissors',
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
