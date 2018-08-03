import external from './../../externalModules.js';
// State
import { getters, state } from './../../store/index.js';
import { getToolState } from './../../stateManagement/toolState.js';
// Util
import isMouseButtonEnabled from './../../util/isMouseButtonEnabled.js';
import {
  getToolsWithMovableHandles,
  findAndMoveHandleNearImagePoint,
  findHandleNearImagePoint,
  findAndMoveAnnotationNearClick,
  findAnnotationNearClick
} from './annotationToolHelpers.js';
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

      evt.stopImmediatePropagation();
      evt.stopPropagation();
      evt.preventDefault();

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

      evt.stopImmediatePropagation();
      evt.stopPropagation();
      evt.preventDefault();
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
