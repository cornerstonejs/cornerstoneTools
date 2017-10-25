import { external } from '../externalModules.js';

export default function (mouseDownCallback) {
  let configuration = {};

  const toolInterface = {
    activate (element, mouseButtonMask, options) {
      external.$(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);
      const eventData = {
        mouseButtonMask,
        options
      };

      external.$(element).on('CornerstoneToolsMouseDownActivate', eventData, mouseDownCallback);
    },
    disable (element) {
      external.$(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);
    },
    enable (element) {
      external.$(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);
    },
    deactivate (element) {
      external.$(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);
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
