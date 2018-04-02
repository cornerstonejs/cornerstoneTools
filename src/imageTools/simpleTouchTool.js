import EVENTS from '../events.js';
import { setToolOptions } from '../toolOptions.js';

export default function (touchStartCallback, toolType) {
  if (!toolType) {
    throw new Error('simpleTouchTool: toolType is required');
  }

  let configuration = {};

  return {
    activate (element, options = {}) {
      setToolOptions(toolType, element, options);

      element.removeEventListener(EVENTS.TOUCH_START, touchStartCallback);
      element.addEventListener(EVENTS.TOUCH_START, touchStartCallback);
    },
    disable (element) {
      element.removeEventListener(EVENTS.TOUCH_START, touchStartCallback);
    },
    enable (element) {
      element.removeEventListener(EVENTS.TOUCH_START, touchStartCallback);
    },
    deactivate (element) {
      element.removeEventListener(EVENTS.TOUCH_START, touchStartCallback);
    },
    getConfiguration () {
      return configuration;
    },
    setConfiguration (config) {
      configuration = config;
    }
  };
}
