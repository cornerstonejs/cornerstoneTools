
import EVENTS from '../events.js';
import external from '../externalModules.js';

export default function (onImageRendered) {
  let configuration = {};

  return {
    disable (element) {
      element.removeEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
    },
    enable (element) {
      element.removeEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
      element.addEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
      external.cornerstone.updateImage(element);
    },
    getConfiguration () {
      return configuration;
    },
    setConfiguration (config) {
      configuration = config;
    }
  };
}
