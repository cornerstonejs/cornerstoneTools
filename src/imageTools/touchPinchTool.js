import { external } from '../externalModules.js';

export default function (touchPinchCallback) {
  const toolInterface = {
    activate (element) {
      external.$(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);
      const eventData = {
      };

      external.$(element).on('CornerstoneToolsTouchPinch', eventData, touchPinchCallback);
    },
    disable (element) {
      external.$(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);
    },
    enable (element) {
      external.$(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);
    },
    deactivate (element) {
      external.$(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);
    }
  };


  return toolInterface;
}
