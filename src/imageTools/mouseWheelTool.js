import EVENTS from '../events.js';

export default function (mouseWheelCallback) {
  return {
    activate (element) {
      element.removeEventListener(EVENTS.MOUSE_WHEEL, mouseWheelCallback);
      element.addEventListener(EVENTS.MOUSE_WHEEL, mouseWheelCallback);
    },
    disable (element) {
      element.removeEventListener(EVENTS.MOUSE_WHEEL, mouseWheelCallback);
    },
    enable (element) {
      element.removeEventListener(EVENTS.MOUSE_WHEEL, mouseWheelCallback);
    },
    deactivate (element) {
      element.removeEventListener(EVENTS.MOUSE_WHEEL, mouseWheelCallback);
    }
  };
}
