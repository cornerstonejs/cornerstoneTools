import { external } from '../externalModules.js';

export default function (doubleTapCallback) {
  return {
    activate (element) {
      external.$(element).off('CornerstoneToolsDoubleTap', doubleTapCallback);
      const eventData = {};

      external.$(element).on('CornerstoneToolsDoubleTap', eventData, doubleTapCallback);
    },
    disable (element) {
      external.$(element).off('CornerstoneToolsDoubleTap', doubleTapCallback);
    },
    enable (element) {
      external.$(element).off('CornerstoneToolsDoubleTap', doubleTapCallback);
    },
    deactivate (element) {
      external.$(element).off('CornerstoneToolsDoubleTap', doubleTapCallback);
    }
  };
}
