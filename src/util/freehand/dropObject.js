import { freehand } from '../../imageTools/freehand.js';
import freeHandIntersect from './freeHandIntersect.js';

export default function (e, toolData) {
  const eventData = e.detail;
  const config = freehand.getConfiguration();

  // Check if drawing is finished
  if (config.movingTextBox === true) {
    dropTextbox(eventData, toolData);

    return 'textBox';
  }

  if (config.modifying) {
    dropHandle(eventData, toolData);

    return 'handle';
  }

  return null;
}

function dropTextbox (eventData, toolData) {
  const config = freehand.getConfiguration();

  config.movingTextBox = false;
  toolData.data[config.currentTool].invalidated = true;
  config.currentHandle = 0;
  config.currentTool = -1;
}

function dropHandle (eventData, toolData) {
  const config = freehand.getConfiguration();
  const currentTool = config.currentTool;

  // Don't allow the line being modified to intersect other lines
  if (freeHandIntersect.modify(toolData.data[currentTool].handles, config.currentHandle)) {
    const currentHandle = config.currentHandle;
    const currentHandleData = toolData.data[currentTool].handles[currentHandle];
    let previousHandleData;

    if (currentHandle === 0) {
      const lastHandleID = toolData.data[currentTool].handles.length - 1;

      previousHandleData = toolData.data[currentTool].handles[lastHandleID];
    } else {
      previousHandleData = toolData.data[currentTool].handles[currentHandle - 1];
    }

    // Snap back to previous position
    currentHandleData.x = config.dragOrigin.x;
    currentHandleData.y = config.dragOrigin.y;
    previousHandleData.lines[0] = currentHandleData;
  }

  return;
}
