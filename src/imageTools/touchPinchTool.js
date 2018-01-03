import EVENTS from '../events.js';

export default function (touchPinchCallback) {
  return {
    activate (element) {
      element.removeEventListener(EVENTS.TOUCH_PINCH, touchPinchCallback);
      element.addEventListener(EVENTS.TOUCH_PINCH, touchPinchCallback);
    },
    disable (element) {
      element.removeEventListener(EVENTS.TOUCH_PINCH, touchPinchCallback);
    },
    enable (element) {
      element.removeEventListener(EVENTS.TOUCH_PINCH, touchPinchCallback);
    },
    deactivate (element) {
      element.removeEventListener(EVENTS.TOUCH_PINCH, touchPinchCallback);
    }
  };
}
