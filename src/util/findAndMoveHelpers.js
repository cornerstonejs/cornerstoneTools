import { state } from '../store/index.js';
import getHandleNearImagePoint from '../manipulators/getHandleNearImagePoint.js';
import moveAllHandles from '../manipulators/moveAllHandles.js';
import moveHandle from '../manipulators/moveHandle.js';

const moveHandleNearImagePoint = function (evt, handle, data, toolName) {
  data.active = true;
  state.isToolLocked = true;
  
  moveHandle(
    evt.detail,
    toolName,
    data,
    handle,
    () => {
      data.active = false;
      state.isToolLocked = false;
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

const moveAnnotationNearClick = function (evt, toolState, tool, data) {
  const opt = tool.options || {
    deleteIfHandleOutsideImage: true,
    preventHandleOutsideImage: false
  };

  data.active = true;
  state.isToolLocked = true;
  // TODO: Ignore MOUSE_MOVE for a bit
  // TODO: Why do this and `moveHandle` expose this in different
  // TODO: ways? PreventHandleOutsideImage
  moveAllHandles(evt, data, toolState, tool.name, opt, () => {
    data.active = false;
    state.isToolLocked = false;
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
  moveHandleNearImagePoint,
  findHandleDataNearImagePoint,
  moveAnnotationNearClick,
  findAnnotationNearClick
};
