import EVENTS from '../events.js';
import { setToolOptions } from '../toolOptions.js';

export default function (mouseDownCallback, toolType) {
  if (!toolType) {
    throw new Error('simpleMouseButtonTool: toolType is required');
  }

  let configuration = {};

  return {
    activate (element, mouseButtonMask, options = {}) {
      options.mouseButtonMask = mouseButtonMask;
      setToolOptions(toolType, element, options);

      element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownCallback);
      element.addEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownCallback);
    },
    disable (element) {
      element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownCallback);
    },
    enable (element) {
      element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownCallback);
    },
    deactivate (element) {
      element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownCallback);
    },
    getConfiguration () {
      return configuration;
    },
    setConfiguration (config) {
      configuration = config;
    }
  };
}
