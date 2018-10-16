import { state } from './index.js';
import { getToolState } from '../stateManagement/toolState.js';
import getHandleNearImagePoint from '../manipulators/getHandleNearImagePoint.js';

/**
 * Filters an array of tools, returning only tools with moveable handles at the
 * mouse location.
 * @export @public @method
 * @name getToolsWithMoveableHandles
 *
 * @param  {HTMLElement} element The element
 * @param  {object[]}    tools   The input tool array.
 * @param  {object}      coords  The coordinates of the mouse position.
 * @returns {object[]}            The filtered array.
 */
export default function (element, tools, coords) {
  return tools.filter((tool) => {
    const toolState = getToolState(element, tool.name);

    for (let i = 0; i < toolState.data.length; i++) {
      if (
        getHandleNearImagePoint(
          element,
          toolState.data[i].handles,
          coords,
          state.clickProximity
        ) !== undefined
      ) {
        return true;
      }
    }

    return false;
  });
}
