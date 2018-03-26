import EVENTS from '../events.js';
import external from '../externalModules.js';
import simpleMouseButtonTool from './simpleMouseButtonTool.js';
import simpleTouchTool from './simpleTouchTool.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { getToolOptions } from '../toolOptions.js';

const toolType = 'rotate';

function defaultStrategy (eventData, initialPoints, initialRotation) {
  // Calculate the center of the image
  const rect = eventData.element.getBoundingClientRect(eventData.element);
  const width = eventData.element.clientWidth;
  const height = eventData.element.clientHeight;

  const centerPoints = {
    x: rect.left + width / 2,
    y: rect.top + height / 2
  };

  const currentPoints = {
    x: eventData.currentPoints.client.x,
    y: eventData.currentPoints.client.y
  };

  const p0 = centerPoints;
  const p1 = initialPoints;
  const p2 = currentPoints;

  // Calculate the (interior) angle in degrees from the initial mouse location
  // To the current mouse location in relation to the center point
  const p12 = Math.sqrt(Math.pow((p0.x - p1.x), 2) + Math.pow((p0.y - p1.y), 2));
  const p13 = Math.sqrt(Math.pow((p0.x - p2.x), 2) + Math.pow((p0.y - p2.y), 2));
  const p23 = Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
  let r = Math.acos(((Math.pow(p12, 2)) + (Math.pow(p13, 2)) - (Math.pow(p23, 2))) /
    (2 * p12 * p13)) * 180 / Math.PI;

  // The direction of the angle (> 0 clockwise, < 0 anti-clockwise)
  const d = (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x);

  if (d < 0) {
    r = -r;
  }

  eventData.viewport.rotation = initialRotation + r;
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

function mouseDownCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;
  const options = getToolOptions(toolType, element);

  const initialPoints = {
    x: eventData.currentPoints.client.x,
    y: eventData.currentPoints.client.y
  };

  const initialRotation = eventData.viewport.rotation;

  if (isMouseButtonEnabled(eventData.which, options.mouseButtonMask)) {
    const boundDragCallback = dragCallback.bind({}, initialPoints, initialRotation);

    const mouseUpCallback = function (e) {
      const eventData = e.detail;
      const element = eventData.element;

      element.removeEventListener(EVENTS.MOUSE_DRAG, boundDragCallback);
      element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
      element.removeEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
    };

    element.addEventListener(EVENTS.MOUSE_DRAG, boundDragCallback);
    element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);

    e.preventDefault();
    e.stopPropagation();
  }
}

function touchStartCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  const initialPoints = {
    x: eventData.currentPoints.client.x,
    y: eventData.currentPoints.client.y
  };

  const initialRotation = eventData.viewport.rotation;

  const boundDragCallback = dragCallback.bind({}, initialPoints, initialRotation);

  const touchEndCallback = function (e) {
    const eventData = e.detail;
    const element = eventData.element;

    element.removeEventListener(EVENTS.TOUCH_DRAG, boundDragCallback);
    element.removeEventListener(EVENTS.TOUCH_END, touchEndCallback);
  };

  element.addEventListener(EVENTS.TOUCH_DRAG, boundDragCallback);
  element.addEventListener(EVENTS.TOUCH_END, touchEndCallback);

  e.preventDefault();
  e.stopPropagation();
}

function dragCallback (initialPoints, initialRotation, e) {
  const eventData = e.detail;

  rotate.strategy(eventData, initialPoints, initialRotation);
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

const rotateTouchDrag = simpleTouchTool(touchStartCallback, toolType);

export {
  rotate,
  rotateTouchDrag
};
