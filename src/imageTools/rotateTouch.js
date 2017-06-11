import * as cornerstone from 'cornerstone-core';

function touchRotateCallback (e, eventData) {
  eventData.viewport.rotation += eventData.rotation;
  cornerstone.setViewport(eventData.element, eventData.viewport);

  return false;
}

function disable (element) {
  $(element).off('CornerstoneToolsTouchRotate', touchRotateCallback);
}

function activate (element) {
  $(element).off('CornerstoneToolsTouchRotate', touchRotateCallback);
  $(element).on('CornerstoneToolsTouchRotate', touchRotateCallback);
}

const rotateTouch = {
  activate,
  disable
};

export default rotateTouch;
