import external from './../../externalModules.js';
// State
import { getters, state } from './../../store/index.js';
import { getToolState } from './../../stateManagement/toolState.js';
// Manipulators
import getHandleNearImagePoint from './../../manipulators/getHandleNearImagePoint.js';
import moveAllHandles from './../../manipulators/moveAllHandles.js';
import moveHandle from './../../manipulators/moveHandle.js';
// Util
import isMouseButtonEnabled from './../../util/isMouseButtonEnabled.js';
// Todo: Where should these live?
import getInteractiveToolsForElement from './../../store/getInteractiveToolsForElement.js';
import getToolsWithDataForElement from './../../store/getToolsWithDataForElement.js';

const cornerstone = external.cornerstone;

/**
 * MouseDown is called before MouseDownActivate. If MouseDown
 * finds an existing tool to interact with, it can prevent the
 * event from bubbling to MouseDownActivate.
 *
 * TODO: Set that a tool is active to prevent multiple event fires
 * TODO: Handles should trigger image update when released
 * TODO: Handles should handle deleting out of bound data by setting
 *
 * @param {*} evt
 * @returns
 */
export default function (evt) {
  if (state.isToolLocked) {
    return;
  }

  let tools;
  const eventData = evt.detail;
  const element = evt.detail.element;
  const coords = evt.detail.currentPoints.canvas;

  // High level filtering
  tools = getInteractiveToolsForElement(element, getters.mouseTools());
  tools = tools.filter((tool) =>
    isMouseButtonEnabled(eventData.which, tool.options.mouseButtonMask)
  );

  const activeTools = tools.filter((tool) => tool.mode === 'active');

  // If any tools are active, check if they have a special reason for dealing with the event.
  if (activeTools.length > 0) {
    // TODO: If length > 1, you could assess fitness and select the ideal tool
    // TODO: But because we're locking this to 'active' tools, that should rarely be an issue
    const firstActiveTool = activeTools[0];

    if (typeof firstActiveTool.activeMouseDownCallback === 'function') {
      const claimEvent = firstActiveTool.activeMouseDownCallback(evt);

      if (claimEvent) {
        return;
      }
    }
  }

  // Annotation tool specific
  const annotationTools = getToolsWithDataForElement(element, tools);
  const annotationToolsWithMoveableHandles = getToolsWithMovableHandles(
    element,
    annotationTools,
    coords
  );

  // HANDLES
  if (annotationToolsWithMoveableHandles.length > 0) {
    const firstToolWithMoveableHandles = annotationToolsWithMoveableHandles[0];
    const toolState = getToolState(element, firstToolWithMoveableHandles.name);

    if (typeof firstToolWithMoveableHandles.handleSelectedCallback === 'function') {
      const handle = findHandleNearImagePoint(
        element,
        evt,
        toolState,
        firstToolWithMoveableHandles.name,
        coords
      );

      firstToolWithMoveableHandles.handleSelectedCallback(evt, handle);

      preventPropagation(evt);

    } else {
      findAndMoveHandleNearImagePoint(
        element,
        evt,
        toolState,
        firstToolWithMoveableHandles.name,
        coords
      );
    }

    return;
  }

  // POINT NEAR
  const annotationToolsWithPointNearClick = tools.filter((tool) => {
    const toolState = getToolState(element, tool.name);

    if (!toolState) {
      return false;
    }

    for (let i = 0; i < toolState.data.length; i++) {
      const data = toolState.data[i];

      if (tool.pointNearTool && tool.pointNearTool(element, data, coords)) {
        return true;
      }
    }

    return false;
  });

  if (annotationToolsWithPointNearClick.length > 0) {
    const firstToolWithPointNearClick = annotationToolsWithPointNearClick[0];
    const toolState = getToolState(element, firstToolWithPointNearClick.name);

    if (typeof firstToolWithPointNearClick.toolSelectedCallback === 'function') {
      const toolData = findAnnotationNearClick(
        element,
        evt,
        toolState,
        firstToolWithPointNearClick,
        coords
      );

      firstToolWithPointNearClick.toolSelectedCallback(evt, toolData);

      preventPropagation(evt);
    } else {
      findAndMoveAnnotationNearClick(
        element,
        evt,
        toolState,
        firstToolWithPointNearClick,
        coords
      );
    }

    return;
  }
}

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

export const findAndMoveHandleNearImagePoint = function (
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

      preventPropagation(evt);

      return;
    }
  }
};

const findHandleNearImagePoint = function (
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
      return handle;
    }
  }
};

const findAndMoveAnnotationNearClick = function (
  element,
  evt,
  toolState,
  tool,
  coords
) {
  const opt = tool.options || {
    deleteIfHandleOutsideImage: true,
    preventHandleOutsideImage: false
  };

  for (let i = 0; i < toolState.data.length; i++) {
    const data = toolState.data[i];
    const isNearPoint = tool.pointNearTool(element, data, coords);

    if (isNearPoint) {
      data.active = true;
      // TODO: Ignore MOUSE_MOVE for a bit
      // TODO: Why do this and `moveHandle` expose this in different
      // TODO: ways? PreventHandleOutsideImage
      moveAllHandles(evt, toolState.data[i], toolState, tool.name, opt, () => {
        data.active = false;
      });

      preventPropagation(evt);

      return;
    }
  }
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

function preventPropagation (evt) {
  evt.stopImmediatePropagation();
  evt.stopPropagation();
  evt.preventDefault();
}
