import { state } from './index.js';
import { getToolState } from '../stateManagement/toolState.js';
import getHandleNearImagePoint from '../manipulators/getHandleNearImagePoint.js';

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
