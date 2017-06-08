import * as cornerstone from 'cornerstone-core';
import simpleMouseButtonTool from './simpleMouseButtonTool.js';
import touchDragTool from './touchDragTool.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';

function mouseUpCallback (e, eventData) {
  $(eventData.element).off('CornerstoneToolsMouseDrag', dragCallback);
  $(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
  $(eventData.element).off('CornerstoneToolsMouseClick', mouseUpCallback);
}

function mouseDownCallback (e, eventData) {
  if (isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
    $(eventData.element).on('CornerstoneToolsMouseDrag', dragCallback);
    $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
    $(eventData.element).on('CornerstoneToolsMouseClick', mouseUpCallback);

    return false; // False = causes jquery to preventDefault() and stopPropagation() this event
  }
}

function dragCallback (e, eventData) {

    // FIXME: Copied from Cornerstone src/internal/calculateTransform.js, should be exposed from there.
  let widthScale = eventData.viewport.scale;
  let heightScale = eventData.viewport.scale;

  if (eventData.image.rowPixelSpacing < eventData.image.columnPixelSpacing) {
    widthScale *= (eventData.image.columnPixelSpacing / eventData.image.rowPixelSpacing);
  } else if (eventData.image.columnPixelSpacing < eventData.image.rowPixelSpacing) {
    heightScale *= (eventData.image.rowPixelSpacing / eventData.image.columnPixelSpacing);
  }

  eventData.viewport.translation.x += (eventData.deltaPoints.page.x / widthScale);
  eventData.viewport.translation.y += (eventData.deltaPoints.page.y / heightScale);
  cornerstone.setViewport(eventData.element, eventData.viewport);

  return false; // False = causes jquery to preventDefault() and stopPropagation() this event
}

const pan = simpleMouseButtonTool(mouseDownCallback);
const panTouchDrag = touchDragTool(dragCallback);

export {
  pan,
  panTouchDrag
};
