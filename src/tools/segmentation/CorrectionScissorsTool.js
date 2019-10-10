import { BaseTool } from '../base';
import { freehandFillInsideCursor } from '../cursors';
import { correction } from './strategies';

/**
 * @public
 * @class CorrectionScissorsTool
 * @memberof Tools
 * @classdesc Tool for correcting segments on a labelmap.
 * @extends Tools.Base.BaseTool
 */
export default class CorrectionScissorsTool extends BaseTool {
  /** @inheritdoc */
  constructor(props = {}) {
    const defaultProps = {
      name: 'CorrectionScissors',
      strategies: {
        CORRECTION: correction,
      },
      cursors: {
        CORRECTION: freehandFillInsideCursor,
      },
      defaultStrategy: 'CORRECTION',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: freehandFillInsideCursor,
      mixins: ['polylineSegmentationMixin'],
    };

    super(props, defaultProps);
  }
}
