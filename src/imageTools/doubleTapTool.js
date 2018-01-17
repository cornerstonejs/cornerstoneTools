import EVENTS from '../events.js';

export default function (doubleTapCallback) {
  return {
    activate (element) {
      element.removeEventListener(EVENTS.DOUBLE_TAP, doubleTapCallback);
      element.addEventListener(EVENTS.DOUBLE_TAP, doubleTapCallback);
    },
    disable (element) {
      element.removeEventListener(EVENTS.DOUBLE_TAP, doubleTapCallback);
    },
    enable (element) {
      element.removeEventListener(EVENTS.DOUBLE_TAP, doubleTapCallback);
    },
    deactivate (element) {
      element.removeEventListener(EVENTS.DOUBLE_TAP, doubleTapCallback);
    }
  };
}
