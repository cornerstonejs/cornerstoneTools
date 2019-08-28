import { BaseTool } from '../base';
import {
  fillInsideRectangle,
  fillOutsideRectangle,
  eraseOutsideRectangle,
  eraseInsideRectangle,
} from './strategies';
import {
  segRectangleFillInsideCursor,
  segRectangleFillOutsideCursor,
  segRectangleEraseInsideCursor,
  segRectangleEraseOutsideCursor,
} from '../cursors';

/**
 * @public
 * @class RectangleScissorsTool
 * @memberof Tools
 * @classdesc Tool for manipulating labelmap data by drawing a rectangle.
 * @extends Tools.Base.BaseTool
 */
export default class RectangleScissorsTool extends BaseTool {
  /** @inheritdoc */
  constructor(props = {}) {
    const defaultProps = {
      name: 'RectangleScissors',
      strategies: {
        FILL_INSIDE: fillInsideRectangle,
        FILL_OUTSIDE: fillOutsideRectangle,
        ERASE_OUTSIDE: eraseOutsideRectangle,
        ERASE_INSIDE: eraseInsideRectangle,
      },
      cursors: {
        FILL_INSIDE: segRectangleFillInsideCursor,
        FILL_OUTSIDE: segRectangleFillOutsideCursor,
        ERASE_OUTSIDE: segRectangleEraseOutsideCursor,
        ERASE_INSIDE: segRectangleEraseInsideCursor,
      },
      defaultStrategy: 'FILL_INSIDE',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      mixins: ['rectangleSegmentationMixin'],
    };

    super(props, defaultProps);
  }
}
