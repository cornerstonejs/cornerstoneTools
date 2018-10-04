
import external from '../externalModules.js';

export default function (onImageRendered) {
  let configuration = {};

  return {
    disable (element) {
      element.removeEventListener(external.cornerstone.EVENTS.IMAGE_RENDERED, onImageRendered);
    },
    enable (element) {
      element.removeEventListener(external.cornerstone.EVENTS.IMAGE_RENDERED, onImageRendered);
      element.addEventListener(external.cornerstone.EVENTS.IMAGE_RENDERED, onImageRendered);
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
