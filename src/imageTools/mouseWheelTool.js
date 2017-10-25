import { external } from '../externalModules.js';

export default function (mouseWheelCallback) {
  const toolInterface = {
    activate (element) {
      external.$(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);
      const eventData = {
      };

      external.$(element).on('CornerstoneToolsMouseWheel', eventData, mouseWheelCallback);
    },
    disable (element) {
      external.$(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);
    },
    enable (element) {
      external.$(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);
    },
    deactivate (element) {
      external.$(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);
    }
  };


  return toolInterface;
}
