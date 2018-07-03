import { FreehandLineFinder } from './FreehandLineFinder.js';
import { FreehandHandleData } from './FreehandHandleData.js';
import { getToolState } from '../../stateManagement/toolState.js';
import external from '../../externalModules.js';

const toolType = 'freehand';

/**
* Inserts or deletes a point from a freehand tool.
*
* @param {Object} e - The event.
* @param {Object} nearby - Object containing information about a nearby handle.
*/
export default function (e, nearby) {
  const eventData = e.detail;

  if (nearby && nearby.handleNearby !== null) {
    const deleteInfo = {
      toolIndex: nearby.toolIndex,
      handleIndex: nearby.handleNearby
    };

    deletePoint(eventData, deleteInfo);
  } else {
    const freehandLineFinder = new FreehandLineFinder(eventData);
    const insertInfo = freehandLineFinder.findLine();

    if (insertInfo) {
      insertPoint(eventData, insertInfo);
    }
  }

  e.preventDefault();
  e.stopPropagation();
}

/**
* Deletes a point from a freehand tool.
*
* @param {Object} eventData - The data object associated with the event.
* @param {Object} deleteInfo - Object containing information about which point to delete.
*/
function deletePoint (eventData, deleteInfo) {
  const toolData = getToolState(eventData.element, toolType);

  if (toolData === undefined) {
    return;
  }

  const deleteHandle = deleteInfo.handleIndex;
  const toolIndex = deleteInfo.toolIndex;

  // Get the toolData from insertInfo
  const data = toolData.data[toolIndex];

  // Only allow delete if > 3 points
  if (data.handles.length <= 3) {
    return;
  }

  // Link the line of the previous handle to the one after handles[deleteHandle];
  if (deleteHandle === data.handles.length - 1) {
    data.handles[deleteHandle - 1].lines.pop();
    data.handles[deleteHandle - 1].lines.push(data.handles[0]);
  } else if (deleteHandle === 0) {
    data.handles[data.handles.length - 1].lines.pop();
    data.handles[data.handles.length - 1].lines.push(data.handles[deleteHandle + 1]);
  } else {
    data.handles[deleteHandle - 1].lines.pop();
    data.handles[deleteHandle - 1].lines.push(data.handles[deleteHandle + 1]);
  }

  // Remove the handle
  data.handles.splice(deleteHandle, 1);

  data.invalidated = true;
  data.active = true;
  data.highlight = true;

  // Force onImageRendered to fire
  external.cornerstone.updateImage(eventData.element);
}

/**
* Inserts a new point into a freehand tool.
*
* @param {Object} eventData - The data object associated with the event.
* @param {Object} insertInfo - Object containing information about where to insert the point.
*/
function insertPoint (eventData, insertInfo) {
  const toolData = getToolState(eventData.element, toolType);

  if (toolData === undefined) {
    return;
  }

  // Get the toolData from insertInfo
  const data = toolData.data[insertInfo.toolIndex];

  const insertIndex = getInsertionIndex(insertInfo);

  if (insertIndex === Infinity) {
    return;
  }

  const handleData = new FreehandHandleData(eventData.currentPoints.image);

  // Add the new handle
  data.handles.splice(insertIndex, 0, handleData);

  // Add the line from the previous handle to the inserted handle (note the tool is now one increment longer)
  data.handles[insertIndex - 1].lines.pop();
  data.handles[insertIndex - 1].lines.push(eventData.currentPoints.image);

  // Add the line from the inserted handle to the handle after
  if (insertIndex === data.handles.length - 1) {
    data.handles[insertIndex].lines.push(data.handles[0]);
  } else {
    data.handles[insertIndex].lines.push(data.handles[insertIndex + 1]);
  }

  data.active = true;
  data.highlight = true;

  // Force onImageRendered to fire
  data.invalidated = true;
  external.cornerstone.updateImage(eventData.element);
}

/**
* Gets the handle index of a tool in which to insert the new point.
*
* @param {Object} insertInfo - Object containing information about where to insert the point.
*/
function getInsertionIndex (insertInfo) {
  // Get lowest index that isn't zero
  const handleIndexArray = insertInfo.handleIndexArray;
  let insertIndex = Infinity;
  const arrayContainsZero = handleIndexArray.includes(0);

  for (let i = 0; i < handleIndexArray.length; i++) {
    const index = handleIndexArray[i];

    if (index !== 0 && index < insertIndex) {
      insertIndex = index;
    }
  }

  // Treat the special case of handleIndexArray === [0,1] || [1,0]
  if (arrayContainsZero && insertIndex === 1) {
    insertIndex = 0;
  }

  // The insertion index shall be just after the lower index
  insertIndex++;

  return insertIndex;
}
