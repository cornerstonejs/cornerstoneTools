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

      if (options && options.touchStartCallback) {
        element.addEventListener(EVENTS.TOUCH_START, options.touchStartCallback);
      }

      if (options && options.touchEndCallback) {
        element.addEventListener(EVENTS.TOUCH_END, options.touchEndCallback);
      }
    },
    disable (element) {
      events.forEach((eventType) => {
        element.removeEventListener(eventType, touchDragCallback);
      });

      if (options && options.disableCallback) {
        options.disableCallback(element);
      }

      if (options && options.touchStartCallback) {
        element.removeEventListener(EVENTS.TOUCH_START, options.touchStartCallback);
      }

      if (options && options.touchEndCallback) {
        element.removeEventListener(EVENTS.TOUCH_END, options.touchEndCallback);
      }
    },
    enable (element) {
      events.forEach((eventType) => {
        element.removeEventListener(eventType, touchDragCallback);
      });

      if (options && options.enableCallback) {
        options.enableCallback(element);
      }

      if (options && options.touchStartCallback) {
        element.removeEventListener(EVENTS.TOUCH_START, options.touchStartCallback);
      }

      if (options && options.touchEndCallback) {
        element.removeEventListener(EVENTS.TOUCH_END, options.touchEndCallback);
      }
    },
    deactivate (element) {
      events.forEach((eventType) => {
        element.removeEventListener(eventType, touchDragCallback);
      });

      if (options && options.deactivateCallback) {
        options.deactivateCallback(element);
      }

      if (options && options.touchStartCallback) {
        element.removeEventListener(EVENTS.TOUCH_START, options.touchStartCallback);
      }

      if (options && options.touchEndCallback) {
        element.removeEventListener(EVENTS.TOUCH_END, options.touchEndCallback);
      }
    }
  };
}
