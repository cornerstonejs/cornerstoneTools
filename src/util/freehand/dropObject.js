import { freehand } from '../../imageTools/freehand.js';

/**
* Places part of the freehand tool when the mouse button is released.
*
* @param {Object} e - The event.
* @param {Object} toolData - The data associated with the freehand tool.
* @modifies {toolData}
*/
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

/**
* Places a freehand tool's textBox.
*
* @param {Object} eventData - Data object associated with the event.
* @param {Object} toolData - The data associated with the freehand tool.
* @modifies {toolData}
*/
function dropTextbox (eventData, toolData) {
  const config = freehand.getConfiguration();

  config.movingTextBox = false;
  toolData.data[config.currentTool].invalidated = true;
  config.currentHandle = 0;
  config.currentTool = -1;
}

/**
* Places a handle of the freehand tool if the new location is valid.
* If the new location is invalid the handle snaps back to its previous position.
*
* @param {Object} eventData - Data object associated with the event.
* @param {Object} toolData - The data associated with the freehand tool.
* @modifies {toolData}
*/
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
}
