import EVENTS from '../events.js';
import simpleMouseButtonTool from '../imageTools/simpleMouseButtonTool.js';
import touchDragTool from '../imageTools/touchDragTool.js';
import mouseWheelTool from '../imageTools/mouseWheelTool.js';
import incrementTimePoint from './incrementTimePoint.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { getToolState } from '../stateManagement/toolState.js';
import { setToolOptions, getToolOptions } from '../toolOptions.js';

const toolType = 'timeSeriesScroll';

function mouseUpCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  element.removeEventListener(EVENTS.MOUSE_DRAG, mouseDragCallback);
  element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
  element.removeEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
}

function mouseDownCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;
  const options = getToolOptions(toolType, element);

  if (isMouseButtonEnabled(eventData.which, options.mouseButtonMask)) {
    options.deltaY = 0;

    setToolOptions(toolType, element, options);

    element.addEventListener(EVENTS.MOUSE_DRAG, mouseDragCallback);
    element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
    e.stopImmediatePropagation();

    return false;
  }
}

function mouseDragCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  e.data.deltaY += eventData.deltaPoints.page.y;

  const toolData = getToolState(eventData.element, 'timeSeries');

  if (toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
    return;
  }

  const timeSeriesData = toolData.data[0];

  let pixelsPerTimeSeries = element.offsetHeight / timeSeriesData.stacks.length;

  if (e.data.options !== undefined && e.data.options.timeSeriesScrollSpeed !== undefined) {
    pixelsPerTimeSeries = e.data.options.timeSeriesScrollSpeed;
  }

  if (e.data.deltaY >= pixelsPerTimeSeries || e.data.deltaY <= -pixelsPerTimeSeries) {
    const timeSeriesDelta = Math.round(e.data.deltaY / pixelsPerTimeSeries);
    const timeSeriesDeltaMod = e.data.deltaY % pixelsPerTimeSeries;

    incrementTimePoint(eventData.element, timeSeriesDelta);
    e.data.deltaY = timeSeriesDeltaMod;
  }

  return false;
}

function mouseWheelCallback (e) {
  const eventData = e.detail;
  const images = -eventData.direction;

  incrementTimePoint(eventData.element, images);
}

function dragCallback (e) {
  const mouseMoveData = e.originalEvent.detail;
  const eventData = {
    deltaY: 0
  };

  eventData.deltaY += mouseMoveData.deltaPoints.page.y;

  const toolData = getToolState(mouseMoveData.element, 'stack');

  if (toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
    return;
  }

  if (eventData.deltaY >= 3 || eventData.deltaY <= -3) {
    const timeSeriesDelta = eventData.deltaY / 3;
    const timeSeriesDeltaMod = eventData.deltaY % 3;

    incrementTimePoint(eventData.element, timeSeriesDelta);
    eventData.deltaY = timeSeriesDeltaMod;
  }

  return false;
}

// Module/private exports
const timeSeriesScroll = simpleMouseButtonTool(mouseDownCallback, toolType);
const timeSeriesScrollWheel = mouseWheelTool(mouseWheelCallback);
const timeSeriesScrollTouchDrag = touchDragTool(dragCallback);

export {
  timeSeriesScroll,
  timeSeriesScrollWheel,
  timeSeriesScrollTouchDrag
};
