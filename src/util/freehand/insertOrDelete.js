import { freehand } from '../../imageTools/freehand.js';
import { FreehandLineFinder } from './FreehandLineFinder.js';
import { FreehandHandleData } from './FreehandHandleData.js';
import { getToolState } from '../../stateManagement/toolState.js';
import external from '../../externalModules.js';

const toolType = 'freehand';

export default function (e, nearby) {
  const eventData = e.detail;

  if (nearby) {
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


function deletePoint (eventData, deleteInfo) {
  const config = freehand.getConfiguration();
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

  // Reset freehand value
  config.freehand = false;

  data.invalidated = true;

  // Force onImageRendered to fire
  external.cornerstone.updateImage(eventData.element);
}


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

  // Force onImageRendered to fire
  data.invalidated = true;
  external.cornerstone.updateImage(eventData.element);
}

function getInsertionIndex (insertInfo) {
  // Get lowest index that isn't zero
  let insertIndex = Infinity;
  let arrayContainsZero = false;

  for (let i = 0; i < insertInfo.handleIndexArray.length; i++) {
    const index = insertInfo.handleIndexArray[i];

    if (index === 0) {
      arrayContainsZero = true;
    } else if (index < insertIndex) {
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
