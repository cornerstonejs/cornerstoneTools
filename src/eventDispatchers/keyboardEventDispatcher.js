import EVENTS from './../events.js';
import keyDown from './keyboardEventHandlers/keyDownEventDispatcher.js';

/**
 * These listeners are emitted in order, and can be cancelled/prevented from bubbling
 * by any previous event.
 * - mouseMove: used to update the [un]hover state of a tool (highlighting)
 * - mouseDown: check to see if we are close to an existing annotation, grab it
 * - mouseDownActivate: createNewMeasurement (usually)
 * - mouseDrag: update measurement or apply strategy (wwwc)
 * - mouseDoubleClick: usually a one-time apply specialty action
 * - onImageRendered: redraw visible tool data
 * @param {*} element
 */
const enable = function (element) {
  element.addEventListener(EVENTS.KEY_DOWN, keyDown);
};

const disable = function (element) {
  element.removeEventListener(EVENTS.KEY_DOWN, keyDown);
};

export default {
  enable,
  disable
};
