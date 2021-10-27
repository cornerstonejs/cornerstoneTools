import { getToolState } from '../stateManagement/toolState.js';
import getHandleNearImagePoint from '../manipulators/getHandleNearImagePoint.js';
import getProximityThreshold from '../util/getProximityThreshold.js';

/**
 * Filters an array of tools, returning only tools with moveable handles at the
 * mouse location.
 *
 * @public
 * @function getToolsWithMoveableHandles
 *
 * @param  {HTMLElement} element The element
 * @param  {Object[]}    tools   The input tool array.
 * @param  {Object}      coords  The coordinates of the mouse position.
 * @param  {string}      [interactionType=mouse]
 * @returns {Object[]}            The filtered array.
 */
export default function(element, tools, coords, interactionType = 'mouse') {
  return tools.filter(tool => {
    const distanceThreshold = getProximityThreshold(interactionType, tool.name);
    const toolState = getToolState(element, tool.name);

    for (let i = 0; i < toolState.data.length; i++) {
      if (
        getHandleNearImagePoint(
          element,
          toolState.data[i].handles,
          coords,
          distanceThreshold
        ) !== undefined
      ) {
        return true;
      }
    }

    return false;
  });
}
