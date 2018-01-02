import EVENTS from '../events.js';

export default function (keyDownCallback) {
  let configuration = {};

  return {
    activate (element) {
      element.removeEventListener(EVENTS.KEY_DOWN, keyDownCallback);
      element.addEventListener(EVENTS.KEY_DOWN, keyDownCallback);
    },
    disable (element) {
      element.removeEventListener(EVENTS.KEY_DOWN, keyDownCallback);
    },
    enable (element) {
      element.removeEventListener(EVENTS.KEY_DOWN, keyDownCallback);
    },
    deactivate (element) {
      element.removeEventListener(EVENTS.KEY_DOWN, keyDownCallback);
    },
    getConfiguration () {
      return configuration;
    },
    setConfiguration (config) {
      configuration = config;
    }
  };
}
