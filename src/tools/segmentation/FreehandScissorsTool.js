import {
  freehandFillInsideCursor,
  freehandFillOutsideCursor,
  freehandEraseOutsideCursor,
  freehandEraseInsideCursor,
} from '../cursors';
import {
  fillInside,
  fillOutside,
  eraseOutside,
  eraseInside,
} from '../../util/segmentation/operations';
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
        FILL_INSIDE: fillInside,
        FILL_OUTSIDE: fillOutside,
        ERASE_OUTSIDE: eraseOutside,
        ERASE_INSIDE: eraseInside,
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
