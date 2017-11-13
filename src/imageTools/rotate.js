import { external } from '../externalModules.js';
import simpleMouseButtonTool from './simpleMouseButtonTool.js';
import touchDragTool from './touchDragTool.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';

// --- Strategies --- //
function defaultStrategy (eventData) {
  // Calculate distance from the center of the image
  const rect = eventData.element.getBoundingClientRect(eventData.element);

  const points = {
    x: eventData.currentPoints.client.x,
    y: eventData.currentPoints.client.y
  };

  const width = eventData.element.clientWidth;
  const height = eventData.element.clientHeight;

  const pointsFromCenter = {
    x: points.x - rect.left - width / 2,
    // Invert the coordinate system so that up is positive
    y: -1 * (points.y - rect.top - height / 2)
  };

  const rotationRadians = Math.atan2(pointsFromCenter.y, pointsFromCenter.x);
  const rotationDegrees = rotationRadians * (180 / Math.PI);
  const rotation = -1 * rotationDegrees + 90;

  eventData.viewport.rotation = rotation;
  external.cornerstone.setViewport(eventData.element, eventData.viewport);
}

function horizontalStrategy (eventData) {
  eventData.viewport.rotation += (eventData.deltaPoints.page.x / eventData.viewport.scale);
  external.cornerstone.setViewport(eventData.element, eventData.viewport);
}

function verticalStrategy (eventData) {
  eventData.viewport.rotation += (eventData.deltaPoints.page.y / eventData.viewport.scale);
  external.cornerstone.setViewport(eventData.element, eventData.viewport);
}

// --- Mouse event callbacks --- //
function mouseUpCallback (e, eventData) {
  external.$(eventData.element).off('CornerstoneToolsMouseDrag', dragCallback);
  external.$(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
  external.$(eventData.element).off('CornerstoneToolsMouseClick', mouseUpCallback);
}

function mouseDownCallback (e, eventData) {
  if (isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
    external.$(eventData.element).on('CornerstoneToolsMouseDrag', dragCallback);
    external.$(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
    external.$(eventData.element).on('CornerstoneToolsMouseClick', mouseUpCallback);

    return false; // False = causes jquery to preventDefault() and stopPropagation() this event
  }
}

function dragCallback (e, eventData) {
  rotate.strategy(eventData);
  external.cornerstone.setViewport(eventData.element, eventData.viewport);

  return false; // False = causes jquery to preventDefault() and stopPropagation() this event
}

const rotate = simpleMouseButtonTool(mouseDownCallback);

rotate.strategies = {
  default: defaultStrategy,
  horizontal: horizontalStrategy,
  vertical: verticalStrategy
};

rotate.strategy = defaultStrategy;

const rotateTouchDrag = touchDragTool(dragCallback);

export {
  rotate,
  rotateTouchDrag
};
