import { getters, state } from '../store/index.js';
import { getToolState } from '../stateManagement/toolState.js';
import getHandleNearImagePoint from '../manipulators/getHandleNearImagePoint.js';
import moveAllHandles from '../manipulators/moveAllHandles.js';
import moveHandle from '../manipulators/moveHandle.js';

const getToolsWithMovableHandles = function (element, tools, coords) {
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
};

const moveHandleNearImagePoint = function (
  evt,
  handle,
  data,
  toolName
) {
  // Todo: We've grabbed a handle, stop listening/ignore for MOUSE_MOVE
  data.active = true;
  moveHandle(
    evt.detail,
    toolName,
    data,
    handle,
    () => {
      data.active = false;
    },
    true // PreventHandleOutsideImage
  );

  evt.stopImmediatePropagation();
  evt.stopPropagation();
  evt.preventDefault();

  return;
};

const findHandleDataNearImagePoint = function (
  element,
  evt,
  toolState,
  toolName,
  coords
) {
  for (let i = 0; i < toolState.data.length; i++) {
    const data = toolState.data[i];
    const handle = getHandleNearImagePoint(
      element,
      data.handles,
      coords,
      state.clickProximity
    );

    if (handle) {
      return {
        handle,
        data
      };
    }
  }
};

const moveAnnotationNearClick = function (
  evt,
  toolState,
  tool,
  data
) {
  const opt = tool.options || {
    deleteIfHandleOutsideImage: true,
    preventHandleOutsideImage: false
  };

  data.active = true;
  // TODO: Ignore MOUSE_MOVE for a bit
  // TODO: Why do this and `moveHandle` expose this in different
  // TODO: ways? PreventHandleOutsideImage
  moveAllHandles(evt, data, toolState, tool.name, opt, () => {
    data.active = false;
  });

  evt.stopImmediatePropagation();
  evt.stopPropagation();
  evt.preventDefault();

  return;
};

const findAnnotationNearClick = function (
  element,
  evt,
  toolState,
  tool,
  coords
) {
  for (let i = 0; i < toolState.data.length; i++) {
    const data = toolState.data[i];
    const isNearPoint = tool.pointNearTool(element, data, coords);

    if (isNearPoint) {
      return data;
    }
  }
};

export {
  getToolsWithMovableHandles,
  moveHandleNearImagePoint,
  findHandleDataNearImagePoint,
  moveAnnotationNearClick,
  findAnnotationNearClick
}
