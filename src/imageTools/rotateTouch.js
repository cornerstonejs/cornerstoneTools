import { external } from '../externalModules.js';

function touchRotateCallback (e, eventData) {
  eventData.viewport.rotation += eventData.rotation;
  external.cornerstone.setViewport(eventData.element, eventData.viewport);

  return false;
}

function disable (element) {
  external.$(element).off('CornerstoneToolsTouchRotate', touchRotateCallback);
}

function activate (element) {
  external.$(element).off('CornerstoneToolsTouchRotate', touchRotateCallback);
  external.$(element).on('CornerstoneToolsTouchRotate', touchRotateCallback);
}

const rotateTouch = {
  activate,
  disable
};

export default rotateTouch;
