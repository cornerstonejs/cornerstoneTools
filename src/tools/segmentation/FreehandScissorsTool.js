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
import { BaseTool } from '../base';

/**
 * @public
 * @class FreehandScissorsTool
 * @memberof Tools
 * @classdesc Tool for manipulating labelmap data by drawing a freehand polygon.
 * @extends Tools.Base.BaseTool
 */
export default class FreehandScissorsTool extends BaseTool {
  /** @inheritdoc */
  constructor(props = {}) {
    const defaultProps = {
      name: 'FreehandScissors',
      strategies: {
        FILL_INSIDE: fillInsideFreehandScissors,
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

  setLabelmapChangeCallback(labelmapChangeCallback) {
    this.labelmapChangeCallback = labelmapChangeCallback;
  }
}

function fillInsideFreehandScissors(evt, operationData) {
  fillInsideFreehand(evt, operationData);
  const { element } = evt.detail;
  if (this.labelmapChangeCallback) {
    this.labelmapChangeCallback(element);
  }
}
