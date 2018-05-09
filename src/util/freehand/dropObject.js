import { freehand } from '../../imageTools/freehand.js';

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

  const dataHandles = toolData.data[currentTool].handles;

  // Don't allow the line being modified to intersect other lines
  if (dataHandles.invalidHandlePlacement) {
    const currentHandle = config.currentHandle;
    const currentHandleData = dataHandles[currentHandle];
    let previousHandleData;

    if (currentHandle === 0) {
      const lastHandleID = dataHandles.length - 1;

      previousHandleData = dataHandles[lastHandleID];
    } else {
      previousHandleData = dataHandles[currentHandle - 1];
    }

    // Snap back to previous position
    currentHandleData.x = config.dragOrigin.x;
    currentHandleData.y = config.dragOrigin.y;
    previousHandleData.lines[0] = currentHandleData;

    dataHandles.invalidHandlePlacement = false;
  }

  return;
}
