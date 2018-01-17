import EVENTS from '../events.js';
import { setToolOptions } from '../toolOptions.js';

export default function (touchDragCallback, toolType, options) {
  const events = [EVENTS.TOUCH_DRAG];

  if (options && options.fireOnTouchStart === true) {
    events.push(EVENTS.TOUCH_START);
  }

  return {
    activate (element) {
      if (options && options.eventData) {
        setToolOptions(toolType, element, options.eventData);
      }

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
    }
  };
}
