import { BaseSegmentationTool } from '../base';
import { freehandFillInsideCursor } from '../cursors';
import { fill } from '../../util/segmentation/index.js';

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
        default: correctionStrategy,
      },
      defaultStrategy: 'default',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: freehandFillInsideCursor,
      mixins: ['freehandSegmentationMixin', 'polylineSegmentationMixin'],
    };

    super(props, defaultProps);
  }
}

function correctionStrategy(evt) {
  fill('Correction', 'default', evt);
}
