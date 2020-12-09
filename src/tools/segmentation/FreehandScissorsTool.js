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
        FILL_INSIDE: (evt, operationData) =>
          this.callStrategyWithLabelmapEvent(
            evt,
            operationData,
            fillInsideFreehand
          ),
        FILL_OUTSIDE: (evt, operationData) =>
          this.callStrategyWithLabelmapEvent(
            evt,
            operationData,
            fillOutsideFreehand
          ),
        ERASE_OUTSIDE: (evt, operationData) =>
          this.callStrategyWithLabelmapEvent(
            evt,
            operationData,
            eraseOutsideFreehand
          ),
        ERASE_INSIDE: (evt, operationData) =>
          this.callStrategyWithLabelmapEvent(
            evt,
            operationData,
            eraseInsideFreehand
          ),
      },
      cursors: {
        FILL_INSIDE: freehandFillInsideCursor,
        FILL_OUTSIDE: freehandFillOutsideCursor,
        ERASE_OUTSIDE: freehandEraseOutsideCursor,
        ERASE_INSIDE: freehandEraseInsideCursor,
      },
      defaultStrategy: 'FILL_INSIDE',
      supportedInteractionTypes: ['Mouse', 'Touch', 'Keyboard'],
      svgCursor: freehandFillInsideCursor,
      mixins: ['freehandSegmentationMixin'],
    };

    super(props, defaultProps);

    this.ctrlCKeyPressed = null;
    this.ctrlVKeyPressed = null;
  }

  setLabelmapChangeCallback(labelmapChangeCallback) {
    this.labelmapChangeCallback = labelmapChangeCallback;
  }

  callStrategyWithLabelmapEvent(evt, operationData, freehandStrategyCallback) {
    freehandStrategyCallback(evt, operationData);
    const { element } = evt.detail;
    if (this.labelmapChangeCallback) {
      this.labelmapChangeCallback(element);
    }
  }

  setCtrlCKeyPressed(ctrlCKeyPressed) {
    this.ctrlCKeyPressed = ctrlCKeyPressed;
  }

  setCtrlVKeyPressed(ctrlVKeyPressed) {
    this.ctrlVKeyPressed = ctrlVKeyPressed;
  }

  handleKeyboardCallback(evt) {
    const { key, ctrlKey } = evt.detail;
    if (key === 'c' && ctrlKey && this.ctrlCKeyPressed) {
      this.ctrlCKeyPressed();
      return;
    } else if (key === 'v' && ctrlKey && this.ctrlVKeyPressed) {
      this.ctrlVKeyPressed();
      return;
    }
    preventPropagation(evt);
  }
}

function preventPropagation(evt) {
  evt.stopImmediatePropagation();
  evt.stopPropagation();
  evt.preventDefault();
}
