import FreehandLineFinder from './FreehandLineFinder.js';
import FreehandHandleData from './FreehandHandleData.js';
import { getToolState } from '../../stateManagement/toolState.js';
import external from '../../externalModules.js';
import addLine from './addLine.js';

/**
 * Inserts or deletes a point from a freehand tool.
 * @export @public @method
 * @name insertOrDelete
 *
 * @param {Object} evt The event.
 * @param {Object} nearby Object containing information about a nearby handle.
 * @returns {void}
 */
export default function(evt, nearby) {
  const eventData = evt.detail;

  if (nearby && nearby.handleNearby !== null) {
    const deleteInfo = {
      toolIndex: nearby.toolIndex,
      handleIndex: nearby.handleNearby,
    };

    _deletePoint.call(this, eventData, deleteInfo);
  } else {
    const freehandLineFinder = new FreehandLineFinder(eventData, this.name);
    const insertInfo = freehandLineFinder.findLine();

    if (insertInfo) {
      _insertPoint.call(this, eventData, insertInfo);
    }
  }
}

/**
 * Deletes a point from a freehand tool.
 * @private
 * @method
 *
 * @param {Object} eventData The data object associated with the event.
 * @param {Object} deleteInfo Object containing information about which point to delete.
 * @returns {void}
 */
function _deletePoint(eventData, deleteInfo) {
  const toolData = getToolState(eventData.element, this.name);

  if (toolData === undefined) {
    return;
  }

  const deleteHandle = deleteInfo.handleIndex;
  const toolIndex = deleteInfo.toolIndex;

  // Get the toolData from insertInfo
  const data = toolData.data[toolIndex];

  const points = data.handles.points;

  // Only allow delete if > 3 points
  if (points.length <= 3) {
    return;
  }

  // Link the line of the previous handle to the one after handles[deleteHandle];
  if (deleteHandle === points.length - 1) {
    points[deleteHandle - 1].lines.pop();
    points[deleteHandle - 1].lines.push(points[0]);
  } else if (deleteHandle === 0) {
    points[points.length - 1].lines.pop();
    points[points.length - 1].lines.push(points[deleteHandle + 1]);
  } else {
    points[deleteHandle - 1].lines.pop();
    points[deleteHandle - 1].lines.push(points[deleteHandle + 1]);
  }

  // Remove the handle
  points.splice(deleteHandle, 1);

  data.invalidated = true;
  data.active = true;
  data.highlight = true;

  // Force onImageRendered to fire
  external.cornerstone.updateImage(eventData.element);
}

/**
 * Inserts a new point into a freehand tool.
 * @private
 * @method
 *
 * @param {Object} eventData - The data object associated with the event.
 * @param {Object} insertInfo - Object containing information about where to insert the point.
 * @returns {void}
 */
function _insertPoint(eventData, insertInfo) {
  const toolData = getToolState(eventData.element, this.name);

  if (toolData === undefined) {
    return;
  }

  // Get the toolData from insertInfo
  const data = toolData.data[insertInfo.toolIndex];

  const insertIndex = _getInsertionIndex(insertInfo);

  if (insertIndex === Infinity) {
    return;
  }

  const handleData = new FreehandHandleData(eventData.currentPoints.image);

  const points = data.handles.points;

  // Add the new handle
  points.splice(insertIndex, 0, handleData);

  // Add the line from the previous handle to the inserted handle (note the tool is now one increment longer)
  points[insertIndex - 1].lines.pop();
  points[insertIndex - 1].lines.push(eventData.currentPoints.image);

  addLine(points, insertIndex);

  data.active = true;
  data.highlight = true;

  // Force onImageRendered to fire
  data.invalidated = true;
  external.cornerstone.updateImage(eventData.element);
}

/**
 * Gets the handle index of a tool in which to insert the new point.
 * @private
 * @method
 *
 * @param {Object} insertInfo - Object containing information about where to insert the point.
 * @returns {void}
 */
function _getInsertionIndex(insertInfo) {
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
