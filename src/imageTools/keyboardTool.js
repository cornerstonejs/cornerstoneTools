import { external } from '../externalModules.js';

export default function (keyDownCallback) {
  let configuration = {};

  const toolInterface = {
    activate (element) {
      external.$(element).off('CornerstoneToolsKeyDown', keyDownCallback);
      external.$(element).on('CornerstoneToolsKeyDown', keyDownCallback);
    },
    disable (element) {
      external.$(element).off('CornerstoneToolsKeyDown', keyDownCallback);
    },
    enable (element) {
      external.$(element).off('CornerstoneToolsKeyDown', keyDownCallback);
    },
    deactivate (element) {
      external.$(element).off('CornerstoneToolsKeyDown', keyDownCallback);
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
