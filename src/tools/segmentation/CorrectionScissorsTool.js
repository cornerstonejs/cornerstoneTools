import { BaseSegmentationTool } from '../base';
import { freehandFillInsideCursor } from '../cursors';
import { correction } from '../../util/segmentation/operations';
import { getCursor } from './../../util/segmentation';

/**
 * @public
 * @class CorrectionScissorsTool
 * @memberof Tools
 * @classdesc Tool for slicing brush pixel data
 * @extends Tools.Base.BaseSegmentationTool
 */
export default class CorrectionScissorsTool extends BaseSegmentationTool {
  /** @inheritdoc */
  constructor(props = {}) {
    const defaultProps = {
      name: 'CorrectionScissors',
      configuration: {
        referencedToolData: 'segmentation',
      },
      strategies: {
        CORRECTION: correction,
      },
      defaultStrategy: 'CORRECTION',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: freehandFillInsideCursor,
      mixins: ['freehandSegmentationMixin', 'polylineSegmentationMixin'],
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
    // TODO: A unique cursor for the correction tool.
    return getCursor(`FreehandScissors`, `default`);
  }
}
