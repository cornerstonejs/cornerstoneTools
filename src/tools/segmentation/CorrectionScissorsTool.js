import { BaseSegmentationTool } from '../base';
import { freehandFillInsideCursor } from '../cursors';
import { correction } from '../../util/segmentation/operations';

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
      cursors: {
        CORRECTION: freehandFillInsideCursor,
      },
      defaultStrategy: 'CORRECTION',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: freehandFillInsideCursor,
      mixins: ['freehandSegmentationMixin', 'freehandPolylineRenderOverride'],
    };

    super(props, defaultProps);
  }
}
