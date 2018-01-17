import EVENTS from '../events.js';

export default function (touchDragCallback, options) {
  let configuration = {};
  const events = [EVENTS.MULTI_TOUCH_DRAG];

  if (options && options.fireOnTouchStart === true) {
    events.push(EVENTS.MULTI_TOUCH_START);
  }

  return {
    activate (element) {
      events.forEach((eventType) => {
        element.removeEventListener(eventType, touchDragCallback);
        element.addEventListener(eventType, touchDragCallback);
      });

      if (options && options.activateCallback) {
        options.activateCallback(element);
      }
    },
    disable (element) {
      events.forEach((eventType) => {
        element.removeEventListener(eventType, touchDragCallback);
      });

      if (options && options.disableCallback) {
        options.disableCallback(element);
      }
    },
    enable (element) {
      events.forEach((eventType) => {
        element.removeEventListener(eventType, touchDragCallback);
      });

      if (options && options.enableCallback) {
        options.enableCallback(element);
      }
    },
    deactivate (element) {
      events.forEach((eventType) => {
        element.removeEventListener(eventType, touchDragCallback);
      });

      if (options && options.deactivateCallback) {
        options.deactivateCallback(element);
      }
    },
    getConfiguration () {
      return configuration;
    },
    setConfiguration (config) {
      configuration = config;
    }
  };
}
