import * as _self from './../index.js';
import { external } from '../externalModules.js';
import mouseButtonTool from './mouseButtonTool.js';
import touchTool from './touchTool.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import getHandleNearImagePoint from '../manipulators/getHandleNearImagePoint.js';
import { getToolState, removeToolState } from '../stateManagement/toolState.js';

const toolTypes = ['length'];
const numToolTypes = toolTypes.length;
const eraserDistance = 8;

function createNewMeasurement () {
  return undefined;
}

function mouseDownCallback (e, eventData) {
  const element = eventData.element;
  let toolDataRemoved = false;

  // Don't proceed if we haven't enabled listening for this mouseButton
  if (!isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
    return;
  }

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

// Module exports
const eraser = mouseButtonTool({
  mouseDownCallback,
  createNewMeasurement
});

const eraserTouch = touchTool({
  mouseDownCallback,
  createNewMeasurement
});

export {
  eraser,
  eraserTouch
};
