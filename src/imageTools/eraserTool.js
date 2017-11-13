import * as _self from './../index.js';
import { external } from '../externalModules.js';
import simpleMouseButtonTool from './simpleMouseButtonTool.js';
import touchDragTool from './touchDragTool.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import getHandleNearImagePoint from '../manipulators/getHandleNearImagePoint.js';
import { getToolState, removeToolState } from '../stateManagement/toolState.js';

const toolTypes = ['length'];
const numToolTypes = toolTypes.length;
const eraserDistance = 10;

let dragEvent;
let dragEventData;

function defaultStrategy (e, eventData) {
  const element = eventData.element;
  let toolDataRemoved = false;

  const coords = eventData.startPoints.canvas;

  // Iterate over toolData, nuke data for tools we clicked near
  for(let i = 0; i < numToolTypes; i++) {
    const toolType = toolTypes[i];
    const hasPointNearToolMethod = _self[toolType].pointNearTool !== undefined;
    const pointNearToolFn = _self[toolType].pointNearTool;
    const toolData = getToolState(e.currentTarget, toolType);

    // Skip tools w/ no data
    if (!toolData) {
      continue;
    }

    for (let j = 0; j < toolData.data.length; j++) {
      const data = toolData.data[j];
      const distance = eraserDistance;
      const isNearHandle = getHandleNearImagePoint(element, data.handles, coords, distance) !== undefined;
      const isNearTool = hasPointNearToolMethod && pointNearToolFn(element, data, coords);

      if (isNearHandle || isNearTool) {
        toolDataRemoved = true;
        removeToolState(element, toolType, data);
        e.stopImmediatePropagation();
      }
    }

    if(toolDataRemoved) {
      external.cornerstone.updateImage(element);
    }
  }
}

function mouseUpCallback (e, eventData) {
  const element = eventData.element;

  external.$(element).off('CornerstoneImageRendered', imageRenderedCallback);
  external.$(element).off('CornerstoneToolsMouseDrag', dragCallback);
  external.$(element).off('CornerstoneToolsMouseUp', mouseUpCallback);
  external.$(element).off('CornerstoneToolsMouseClick', mouseUpCallback);
  external.cornerstone.updateImage(eventData.element);
}

function mouseDownCallback (e, eventData) {
  const element = eventData.element;

  if (!isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
    return;
  }

  external.$(element).on('CornerstoneImageRendered', imageRenderedCallback);
  external.$(element).on('CornerstoneToolsMouseDrag', dragCallback);
  external.$(element).on('CornerstoneToolsMouseUp', mouseUpCallback);
  external.$(element).on('CornerstoneToolsMouseClick', mouseUpCallback);
  eraser.strategy(e, eventData);

  return false; // False = causes jquery to preventDefault() and stopPropagation() this event
}

function imageRenderedCallback () {
  if (dragEvent && dragEventData) {
    eraser.strategy(dragEvent, dragEventData);
    dragEvent = null;
    dragEventData = null;
  }
}

// The strategy can't be execute at this moment because the image is rendered asynchronously
// (requestAnimationFrame). Then the eventData that contains all information needed is being
// Cached and the strategy will be executed once CornerstoneImageRendered is triggered.
function dragCallback (e, eventData) {
  const element = eventData.element;

  dragEvent = e;
  dragEventData = eventData;
  external.cornerstone.updateImage(element);

  return false; // False = causes jquery to preventDefault() and stopPropagation() this event
}

const eraser = simpleMouseButtonTool(mouseDownCallback);

eraser.strategies = {
  default: defaultStrategy
};

eraser.strategy = defaultStrategy;

const options = {
  fireOnTouchStart: true
};

const eraserTouch = touchDragTool(dragCallback, options);

export {
  eraser,
  eraserTouch
};
