import EVENTS from '../events.js';
import external from '../externalModules.js';
import simpleMouseButtonTool from './simpleMouseButtonTool.js';
import touchDragTool from './touchDragTool.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { getToolOptions } from '../toolOptions.js';

const toolType = 'rotate';

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
function mouseUpCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  element.removeEventListener(EVENTS.MOUSE_DRAG, dragCallback);
  element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
  element.removeEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
}

function mouseDownCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;
  const options = getToolOptions(toolType, element);

  if (isMouseButtonEnabled(eventData.which, options.mouseButtonMask)) {
    element.addEventListener(EVENTS.MOUSE_DRAG, dragCallback);
    element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);

    e.preventDefault();
    e.stopPropagation();
  }
}

function dragCallback (e) {
  const eventData = e.detail;

  rotate.strategy(eventData);
  external.cornerstone.setViewport(eventData.element, eventData.viewport);

  e.preventDefault();
  e.stopPropagation();
}

const rotate = simpleMouseButtonTool(mouseDownCallback, toolType);

rotate.strategies = {
  default: defaultStrategy,
  horizontal: horizontalStrategy,
  vertical: verticalStrategy
};

rotate.strategy = defaultStrategy;

const rotateTouchDrag = touchDragTool(dragCallback, toolType);

export {
  rotate,
  rotateTouchDrag
};
