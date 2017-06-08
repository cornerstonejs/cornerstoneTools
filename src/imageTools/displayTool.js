import * as cornerstone from 'cornerstone-core';

export default function (onImageRendered) {
  let configuration = {};

  const toolInterface = {
    disable (element) {
      $(element).off('CornerstoneImageRendered', onImageRendered);
    },
    enable (element) {
      $(element).off('CornerstoneImageRendered', onImageRendered);
      $(element).on('CornerstoneImageRendered', onImageRendered);
      cornerstone.updateImage(element);
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
