import EVENTS from '../events.js';
import {
  tap,
  doubleTap,
  touchStart,
  touchStartActive,
  touchDrag,
  touchEnd,
  touchPress,
  touchPinch,
  onImageRendered
} from './touchEventHandlers/index.js';

/**
 * These listeners are emitted in order, and can be cancelled/prevented from bubbling
 * by any previous event.
 * - tap:
 * - touchStart: check to see if we are close to an existing annotation, grab it
 * - touchDrag:
 * - touchStartActive: createNewMeasurement (usually)
 * - touchPress:
 * - doubleTap: usually a one-time apply specialty action
 * - touchPinch:
 * - onImageRendered: redraw visible tool data
 * @param {*} element
 */
const enable = function (element) {
  console.log('enableTouch', element);
  element.addEventListener(EVENTS.TAP, tap);
  element.addEventListener(EVENTS.TOUCH_START, touchStart);
  element.addEventListener(EVENTS.TOUCH_DRAG, touchDrag);
  element.addEventListener(EVENTS.TOUCH_END, touchEnd);
  // Mouse equivelant is `mouse_down_activate`
  // Should the naming pattern here match?
  element.addEventListener(EVENTS.TOUCH_START_ACTIVE, touchStartActive);
  element.addEventListener(EVENTS.TOUCH_PRESS, touchPress);
  element.addEventListener(EVENTS.DOUBLE_TAP, doubleTap);
  element.addEventListener(EVENTS.TOUCH_PINCH, touchPinch);
  element.addEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
};

export default {
  enable
  // Disable
};
