import simpleMouseButtonTool from '../imageTools/simpleMouseButtonTool';
import touchDragTool from '../imageTools/touchDragTool';
import mouseWheelTool from '../imageTools/mouseWheelTool';
import incrementTimePoint from './incrementTimePoint';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled';
import { getToolState } from '../stateManagement/toolState';

function mouseUpCallback (e, eventData) {
  $(eventData.element).off('CornerstoneToolsMouseDrag', mouseDragCallback);
  $(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
  $(eventData.element).off('CornerstoneToolsMouseClick', mouseUpCallback);
}

function mouseDownCallback (e, eventData) {
  if (isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {

    const mouseDragEventData = {
      deltaY: 0,
      options: e.data.options
    };

    $(eventData.element).on('CornerstoneToolsMouseDrag', mouseDragEventData, mouseDragCallback);
    $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
    $(eventData.element).on('CornerstoneToolsMouseClick', mouseUpCallback);
    e.stopImmediatePropagation();

    return false;
  }
}

function mouseDragCallback (e, eventData) {
  e.data.deltaY += eventData.deltaPoints.page.y;

  const toolData = getToolState(eventData.element, 'timeSeries');

  if (toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
    return;
  }

  const timeSeriesData = toolData.data[0];

  let pixelsPerTimeSeries = $(eventData.element).height() / timeSeriesData.stacks.length;

  if (e.data.options !== undefined && e.data.options.timeSeriesScrollSpeed !== undefined) {
    pixelsPerTimeSeries = e.data.options.timeSeriesScrollSpeed;
  }

  if (e.data.deltaY >= pixelsPerTimeSeries || e.data.deltaY <= -pixelsPerTimeSeries) {
    const timeSeriesDelta = Math.round(e.data.deltaY / pixelsPerTimeSeries);
    const timeSeriesDeltaMod = e.data.deltaY % pixelsPerTimeSeries;

    incrementTimePoint(eventData.element, timeSeriesDelta);
    e.data.deltaY = timeSeriesDeltaMod;
  }

  return false; // False = cases jquery to preventDefault() and stopPropagation() this event
}

function mouseWheelCallback (e, eventData) {
  const images = -eventData.direction;

  incrementTimePoint(eventData.element, images);
}

function onDrag (e) {
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

  return false; // False = cases jquery to preventDefault() and stopPropagation() this event
}

// Module/private exports
const timeSeriesScroll = simpleMouseButtonTool(mouseDownCallback);
const timeSeriesScrollWheel = mouseWheelTool(mouseWheelCallback);
const timeSeriesScrollTouchDrag = touchDragTool(onDrag);

export {
  timeSeriesScroll,
  timeSeriesScrollWheel,
  timeSeriesScrollTouchDrag
};
