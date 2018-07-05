import * as cornerstoneTools from '../index.js';
import EVENTS from '../events.js';
import external from '../externalModules.js';

const toolType = 'eraser';

function eventListeners (event) {
  function activate (element) {
    element.addEventListener(event, deleteNearbyMeasurement);
  }

  function deactivate (element) {
    element.removeEventListener(event, deleteNearbyMeasurement);
  }

  function disable (element) {
    element.removeEventListener(event, deleteNearbyMeasurement);
  }

  function enable (element) {
    element.removeEventListener(event, deleteNearbyMeasurement);
  }

  return {
    activate,
    deactivate,
    disable,
    enable
  };
}

function pointNearTool () {
  return false;
}

function deleteNearbyMeasurement (mouseEventData) {
  const coords = mouseEventData.detail.currentPoints.canvas;
  const element = mouseEventData.detail.element;

  Object.keys(cornerstoneTools).forEach(function (toolName) {
    const tool = cornerstoneTools[toolName]; // eslint-disable-line import/namespace
    const toolState = cornerstoneTools.getToolState(element, toolName);

    if (toolState) {
      toolState.data.forEach(function (data) {
        if(tool.pointNearTool(element, data, coords)) {
          cornerstoneTools.removeToolState(element, toolName, data);
          external.cornerstone.updateImage(element);
        }
      });
    }
  });
}

const eraser = Object.assign({},
  eventListeners(EVENTS.MOUSE_CLICK),
  {
    pointNearTool,
    toolType
  }
);

const eraserTouch = Object.assign({},
  eventListeners(EVENTS.TOUCH_PRESS),
  {
    pointNearTool,
    toolType
  }
);

export {
  eraser,
  eraserTouch
};
