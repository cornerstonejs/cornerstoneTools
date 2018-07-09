import * as cornerstoneTools from '../index.js';
import external from '../externalModules.js';
import simpleMouseButtonTool from './simpleMouseButtonTool.js';
import simpleTouchTool from './simpleTouchTool.js';

const toolType = 'eraser';

function deleteNearbyMeasurement (mouseEventData) {
  const coords = mouseEventData.detail.currentPoints.canvas;
  const element = mouseEventData.detail.element;

  Object.keys(cornerstoneTools).forEach(function (toolName) {
    const tool = cornerstoneTools[toolName]; // eslint-disable-line import/namespace
    const toolState = cornerstoneTools.getToolState(element, toolName);

    if (toolState) {
      toolState.data.forEach(function (data) {
        if(typeof tool.pointNearTool === 'function' &&
          tool.pointNearTool(element, data, coords)) {
          cornerstoneTools.removeToolState(element, toolName, data);
          external.cornerstone.updateImage(element);
        }
      });
    }
  });
}

const eraser = simpleMouseButtonTool(deleteNearbyMeasurement, toolType);
const eraserTouch = simpleTouchTool(deleteNearbyMeasurement, toolType);

export {
  eraser,
  eraserTouch
};
