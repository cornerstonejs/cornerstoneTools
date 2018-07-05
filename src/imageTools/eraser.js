import * as cornerstoneTools from '../index.js';
import EVENTS from '../events.js';
import external from '../externalModules.js';

const toolType = 'eraser';

function eventListeners (event) {
  return {
    activate: function (element) {
      element.addEventListener(event, deleteNearbyMeasurement);
    },
    deactivate: function (element) {
      element.removeEventListener(event, deleteNearbyMeasurement);
    },
    disable: function (element) {
      element.removeEventListener(event, deleteNearbyMeasurement);
    },
    enable: function (element) {
      element.removeEventListener(event, deleteNearbyMeasurement);
    }
  }
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

const eraser = {
  ...eventListeners(EVENTS.MOUSE_CLICK),
  pointNearTool,
  toolType
};

const eraserTouch = {
  ...eventListeners(EVENTS.TOUCH_PRESS),
  pointNearTool,
  toolType
}

export {
  eraser,
  eraserTouch
};
