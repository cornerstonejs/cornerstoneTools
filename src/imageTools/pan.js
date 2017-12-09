import EVENTS from '../events.js';
import external from '../externalModules.js';
import simpleMouseButtonTool from './simpleMouseButtonTool.js';
import touchDragTool from './touchDragTool.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { getToolOptions } from '../toolOptions.js';

const toolType = 'pan';

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
  external.cornerstone.setViewport(eventData.element, eventData.viewport);

  e.preventDefault();
  e.stopPropagation();
}

const pan = simpleMouseButtonTool(mouseDownCallback, toolType);
const panTouchDrag = touchDragTool(dragCallback, toolType);

export {
  pan,
  panTouchDrag
};
