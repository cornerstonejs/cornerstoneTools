import { freehandFillInsideCursor } from '../cursors';
import {
  fillInside,
  fillOutside,
  eraseOutside,
  eraseInside,
} from '../../util/segmentation';
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
      defaultStrategy: 'FILL_INSIDE',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: freehandFillInsideCursor,
      mixins: ['freehandSegmentationMixin'],
    };

    super(props, defaultProps);
  }
}
