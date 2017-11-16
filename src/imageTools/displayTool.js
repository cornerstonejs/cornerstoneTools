import { external } from '../externalModules.js';

export default function (onImageRendered) {
  let configuration = {};

  // Note: This is to maintain compatibility for developers that have
  // Built on top of mouseButtonRectangleTool.js
  // TODO: Remove this after we migrate Cornerstone Tools away from jQuery
  function customEventOnImageRendered (e) {
    onImageRendered(e, e.detail);
  }

  const toolInterface = {
    disable (element) {
      element.removeEventListener('cornerstoneimagerendered', customEventOnImageRendered);
    },
    enable (element) {
      element.removeEventListener('cornerstoneimagerendered', customEventOnImageRendered);
      element.addEventListener('cornerstoneimagerendered', customEventOnImageRendered);
      external.cornerstone.updateImage(element);
    },
    getConfiguration () {
      return configuration;
    },
    setConfiguration (config) {
      configuration = config;
    }
  };

  return toolInterface;
}
