import { freehandFillInsideCursor } from '../cursors';
import {
  fillInside,
  fillOutside,
  eraseOutside,
  eraseInside,
} from '../../util/segmentation/operations';
import { BaseSegmentationTool } from '../base';
import { getCursor } from './../../util/segmentation';

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

  /**
   * Gets The cursor according to strategy.
   *
   * @param  {string} strategy the operation strategy.
   * @returns {MouseCursor}
   */
  _getCursor(strategy) {
    return getCursor(`FreehandScissors`, strategy);
  }
}
