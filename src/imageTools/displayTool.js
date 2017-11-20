import external from '../externalModules.js';

export default function (onImageRendered) {
  let configuration = {};

  const toolInterface = {
    disable (element) {
      external.$(element).off('CornerstoneImageRendered', onImageRendered);
    },
    enable (element) {
      external.$(element).off('CornerstoneImageRendered', onImageRendered);
      external.$(element).on('CornerstoneImageRendered', onImageRendered);
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
