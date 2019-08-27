import {
  freehandFillInsideCursor,
  freehandFillOutsideCursor,
  freehandEraseOutsideCursor,
  freehandEraseInsideCursor,
} from '../cursors';
import {
  fillInsideFreehand,
  fillOutsideFreehand,
  eraseOutsideFreehand,
  eraseInsideFreehand,
} from './strategies';
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
      strategies: {
        FILL_INSIDE: fillInsideFreehand,
        FILL_OUTSIDE: fillOutsideFreehand,
        ERASE_OUTSIDE: eraseOutsideFreehand,
        ERASE_INSIDE: eraseInsideFreehand,
      },
      cursors: {
        FILL_INSIDE: freehandFillInsideCursor,
        FILL_OUTSIDE: freehandFillOutsideCursor,
        ERASE_OUTSIDE: freehandEraseOutsideCursor,
        ERASE_INSIDE: freehandEraseInsideCursor,
      },
      defaultStrategy: 'FILL_INSIDE',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: freehandFillInsideCursor,
      mixins: ['freehandSegmentationMixin'],
    };

    super(props, defaultProps);
  }
}
