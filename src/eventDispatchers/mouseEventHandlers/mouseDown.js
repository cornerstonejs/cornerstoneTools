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

/**
 * MouseDown is called before MouseDownActivate. If MouseDown
 * finds an existing tool to interact with, it can prevent the
 * event from bubbling to MouseDownActivate.
 *
 * TODO: Set that a tool is active to prevent multiple event fires
 * TODO: Handles should trigger image update when released
 * TODO: Handles should handle delting out of bound data by setting
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

  // Check if any tool has a special reason to grab the current event
  const specialTools = tools.filter(
    (tool) =>
      typeof tool.mouseDownCallback === 'function' &&
      typeof tool.isValidTarget === 'function' &&
      tool.mode === 'active' &&
      tool.isValidTarget(evt)
  );

  if (specialTools.length > 0) {
    // TODO: If lenth > 1, you could assess fitness and select the ideal tool
    // TODO: But because we're locking this to 'active' tools, that should rarely be an issue
    const firstSpecialTool = specialTools[0];

    firstSpecialTool.mouseDownCallback(evt);

    return;
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

    const hasCustomMouseDownCallback =
      firstToolWithMoveableHandles.mouseDownCallback === 'function';

    const throwAway = hasCustomMouseDownCallback
      ? firstToolWithMoveableHandles.mouseDownCallback(evt)
      : findAndMoveHandleNearImagePoint(
        element,
        evt,
        toolState,
        firstToolWithMoveableHandles.name,
        coords
      );

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

    const hasCustomMouseDownCallback =
      firstToolWithPointNearClick.mouseDownCallback === 'function';

    const throwAway = hasCustomMouseDownCallback
      ? firstToolWithPointNearClick.mouseDownCallback(evt)
      : findAndMoveAnnotationNearClick(
        element,
        evt,
        toolState,
        firstToolWithPointNearClick,
        coords
      );

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

const findAndMoveHandleNearImagePoint = function (
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

      evt.stopImmediatePropagation();
      evt.stopPropagation();
      evt.preventDefault();

      return;
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

      evt.stopImmediatePropagation();
      evt.stopPropagation();
      evt.preventDefault();

      return;
    }
  }
};
