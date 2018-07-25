import * as cornerstoneTools from '../index.js';
import external from '../externalModules.js';
import EVENTS from '../events.js';
import { setToolOptions } from '../toolOptions.js';
import simpleTouchTool from './simpleTouchTool.js';

const toolType = 'eraser';
let configuration = {
  supportedTools: {}
};

function populateSupportedTools () {
  configuration.supportedTools = {};
  Object.keys(cornerstoneTools).forEach(function (toolName) {
    const tool = cornerstoneTools[toolName]; // eslint-disable-line import/namespace

    if (typeof tool.pointNearTool === 'function') {
      configuration.supportedTools[toolName] = tool;
    }
  });
}

function deleteNearbyMeasurement (mouseEventData) {
  const coords = mouseEventData.detail.currentPoints.canvas;
  const element = mouseEventData.detail.element;
  let foundDataToDelete = false;
  let imageNeedsUpdate = false;

  Object.entries(configuration.supportedTools).forEach(function ([toolName, tool]) {
    const toolState = cornerstoneTools.getToolState(element, toolName);

    if (toolState) {
      toolState.data.forEach(function (data) {
        if (!foundDataToDelete && tool.pointNearTool(element, data, coords)) {
          cornerstoneTools.removeToolState(element, toolName, data);
          foundDataToDelete = true;
          imageNeedsUpdate = true;
        }
      });
    }
  });

  if (imageNeedsUpdate) {
    external.cornerstone.updateImage(element);
  }
}

function highlightNearbyMeasurement (mouseEventData) {
  const coords = mouseEventData.detail.currentPoints.canvas;
  const element = mouseEventData.detail.element;
  let imageNeedsUpdate = false;
  let foundFirstActive = false;

  Object.entries(configuration.supportedTools).forEach(function ([toolName, tool]) {
    const toolState = cornerstoneTools.getToolState(element, toolName);

    if (toolState) {
      toolState.data.forEach(function (data) {
        if (data.active) {
          data.active = false;
          imageNeedsUpdate = true;
        }

        if (!foundFirstActive && tool.pointNearTool(element, data, coords)) {
          data.active = true;
          imageNeedsUpdate = true;
          foundFirstActive = true;
        }
      });
    }
  });

  if (imageNeedsUpdate) {
    external.cornerstone.updateImage(element);
  }
}

const eraser = {
  activate (element, mouseButtonMask, options = {}) {
    options.mouseButtonMask = mouseButtonMask;
    setToolOptions(toolType, element, options);

    element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, deleteNearbyMeasurement);
    element.removeEventListener(EVENTS.MOUSE_MOVE, highlightNearbyMeasurement);

    element.addEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, deleteNearbyMeasurement);
    element.addEventListener(EVENTS.MOUSE_MOVE, highlightNearbyMeasurement);

    populateSupportedTools();
  },

  disable (element) {
    element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, deleteNearbyMeasurement);
    element.removeEventListener(EVENTS.MOUSE_MOVE, highlightNearbyMeasurement);
  },

  enable (element) {
    element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, deleteNearbyMeasurement);
    element.removeEventListener(EVENTS.MOUSE_MOVE, highlightNearbyMeasurement);
  },

  deactivate (element) {
    element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, deleteNearbyMeasurement);
    element.removeEventListener(EVENTS.MOUSE_MOVE, highlightNearbyMeasurement);
  },

  getConfiguration () {
    return configuration;
  },

  setConfiguration (config) {
    configuration = config;
  }
};
const eraserTouch = simpleTouchTool(deleteNearbyMeasurement, toolType);

export {
  eraser,
  eraserTouch
};
