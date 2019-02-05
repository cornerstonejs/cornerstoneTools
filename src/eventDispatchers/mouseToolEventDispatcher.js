import EVENTS from './../events.js';
import {
  mouseClick,
  mouseDown,
  mouseDownActivate,
  mouseDoubleClick,
  mouseDrag,
  mouseMove,
  mouseUp,
  mouseWheel,
} from './mouseEventHandlers/index.js';

/**
 * These listeners are emitted in order, and can be cancelled/prevented from bubbling
 * by any previous event.
 * - mouseMove: used to update the [un]hover state of a tool (highlighting)
 * - mouseDown: check to see if we are close to an existing annotation, grab it
 * - mouseDownActivate: createNewMeasurement (usually)
 * - mouseDrag: update measurement or apply strategy (wwwc)
 * - mouseDoubleClick: usually a one-time apply specialty action
 * - onImageRendered: redraw visible tool data
 * @private
 * @param {*} element
 * @returns {undefined}
 */
const enable = function(element) {
  element.addEventListener(EVENTS.MOUSE_CLICK, mouseClick);
  element.addEventListener(EVENTS.MOUSE_DOWN, mouseDown);
  element.addEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivate);
  element.addEventListener(EVENTS.MOUSE_DOUBLE_CLICK, mouseDoubleClick);
  element.addEventListener(EVENTS.MOUSE_DRAG, mouseDrag);
  element.addEventListener(EVENTS.MOUSE_MOVE, mouseMove);
  element.addEventListener(EVENTS.MOUSE_UP, mouseUp);
  element.addEventListener(EVENTS.MOUSE_WHEEL, mouseWheel);
};

const disable = function(element) {
  element.removeEventListener(EVENTS.MOUSE_CLICK, mouseClick);
  element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDown);
  element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivate);
  element.removeEventListener(EVENTS.MOUSE_DOUBLE_CLICK, mouseDoubleClick);
  element.removeEventListener(EVENTS.MOUSE_DRAG, mouseDrag);
  element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMove);
  element.removeEventListener(EVENTS.MOUSE_UP, mouseUp);
  element.removeEventListener(EVENTS.MOUSE_WHEEL, mouseWheel);
};

export default {
  enable,
  disable,
};
