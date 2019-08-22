import { BaseSegmentationTool } from '../base';
import {
  fillInsideRectangle,
  fillOutsideRectangle,
  eraseOutsideRectangle,
  eraseInsideRectangle,
} from '../../util/segmentation/operations';
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
      svgCursor: segRectangleFillInsideCursor,
      mixins: ['rectangleSegmentationMixin'],
    };

    super(props, defaultProps);
  }
}
