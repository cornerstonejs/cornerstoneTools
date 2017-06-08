import * as cornerstone from 'cornerstone-core';
import simpleMouseButtonTool from './simpleMouseButtonTool.js';
import touchDragTool from './touchDragTool.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';

function mouseUpCallback (e, eventData) {
  $(eventData.element).off('CornerstoneToolsMouseDrag', mouseDragCallback);
  $(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
  $(eventData.element).off('CornerstoneToolsMouseClick', mouseUpCallback);
}

function mouseDownCallback (e, eventData) {
  if (isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
    $(eventData.element).on('CornerstoneToolsMouseDrag', mouseDragCallback);
    $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
    $(eventData.element).on('CornerstoneToolsMouseClick', mouseUpCallback);

    return false; // False = causes jquery to preventDefault() and stopPropagation() this event
  }
}

function defaultStrategy (eventData) {
    // Here we normalize the ww/wc adjustments so the same number of on screen pixels
    // Adjusts the same percentage of the dynamic range of the image.  This is needed to
    // Provide consistency for the ww/wc tool regardless of the dynamic range (e.g. an 8 bit
    // Image will feel the same as a 16 bit image would)
  const maxVOI = eventData.image.maxPixelValue * eventData.image.slope + eventData.image.intercept;
  const minVOI = eventData.image.minPixelValue * eventData.image.slope + eventData.image.intercept;
  const imageDynamicRange = maxVOI - minVOI;
  const multiplier = imageDynamicRange / 1024;

  const deltaX = eventData.deltaPoints.page.x * multiplier;
  const deltaY = eventData.deltaPoints.page.y * multiplier;

  eventData.viewport.voi.windowWidth += (deltaX);
  eventData.viewport.voi.windowCenter += (deltaY);
}

function mouseDragCallback (e, eventData) {
  wwwc.strategy(eventData);
  cornerstone.setViewport(eventData.element, eventData.viewport);

  return false; // False = cases jquery to preventDefault() and stopPropagation() this event
}

function touchDragCallback (e, eventData) {
  e.stopImmediatePropagation(); // Prevent CornerstoneToolsTouchStartActive from killing any press events
  const dragData = eventData;

  const maxVOI = dragData.image.maxPixelValue * dragData.image.slope + dragData.image.intercept;
  const minVOI = dragData.image.minPixelValue * dragData.image.slope + dragData.image.intercept;
  const imageDynamicRange = maxVOI - minVOI;
  const multiplier = imageDynamicRange / 1024;
  const deltaX = dragData.deltaPoints.page.x * multiplier;
  const deltaY = dragData.deltaPoints.page.y * multiplier;

  const config = wwwc.getConfiguration();

  if (config.orientation) {
    if (config.orientation === 0) {
      dragData.viewport.voi.windowWidth += (deltaX);
      dragData.viewport.voi.windowCenter += (deltaY);
    } else {
      dragData.viewport.voi.windowWidth += (deltaY);
      dragData.viewport.voi.windowCenter += (deltaX);
    }
  } else {
    dragData.viewport.voi.windowWidth += (deltaX);
    dragData.viewport.voi.windowCenter += (deltaY);
  }

  cornerstone.setViewport(dragData.element, dragData.viewport);
}

const wwwc = simpleMouseButtonTool(mouseDownCallback);

wwwc.strategies = {
  default: defaultStrategy
};

wwwc.strategy = defaultStrategy;

const wwwcTouchDrag = touchDragTool(touchDragCallback);

export {
  wwwc,
  wwwcTouchDrag
};
