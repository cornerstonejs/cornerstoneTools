// State
import { getters, state } from './../../store/index.js';
import { getToolState } from './../../stateManagement/toolState.js';
// Util
import getToolsWithMovableHandles from '../../store/getToolsWithMoveableHandles.js';
import {
  findHandleDataNearImagePoint,
  findAnnotationNearClick
} from '../../util/findAndMoveHelpers.js';
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
  tools = tools.filter(
    (tool) => eventData.buttons === tool.options.mouseButtonMask
  );

  // ACTIVE TOOL W/ PRE CALLBACK?
  const activeTools = tools.filter((tool) => tool.mode === 'active');

  // If any tools are active, check if they have a special reason for dealing with the event.
  if (activeTools.length > 0) {
    // TODO: If length > 1, you could assess fitness and select the ideal tool
    // TODO: But because we're locking this to 'active' tools, that should rarely be an issue
    // Super-Meta-TODO: ^ I think we should just take the approach of one active tool per mouse button?
    const firstActiveToolWithCallback = activeTools.find(
      (tool) => typeof tool.preMouseDownCallback === 'function'
    );

    if (firstActiveToolWithCallback) {
      const consumedEvent = firstActiveToolWithCallback.preMouseDownCallback(
        evt
      );

      if (consumedEvent) {
        return;
      }
    }
  }

  // Annotation tool specific
  const annotationTools = getToolsWithDataForElement(element, tools);

  // NEAR HANDLES?
  const annotationToolsWithMoveableHandles = getToolsWithMovableHandles(
    element,
    annotationTools,
    coords
  );

  if (annotationToolsWithMoveableHandles.length > 0) {
    const firstToolWithMoveableHandles = annotationToolsWithMoveableHandles[0];
    const toolState = getToolState(element, firstToolWithMoveableHandles.name);

    const { handle, data } = findHandleDataNearImagePoint(
      element,
      evt,
      toolState,
      firstToolWithMoveableHandles.name,
      coords
    );

    firstToolWithMoveableHandles.handleSelectedCallback(evt, handle, data);

    return;
  }

  // NEAR TOOL?
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

    const toolData = findAnnotationNearClick(
      element,
      evt,
      toolState,
      firstToolWithPointNearClick,
      coords
    );

    firstToolWithPointNearClick.toolSelectedCallback(evt, toolData, toolState);

    return;
  }

  // ACTIVE TOOL W/ POST CALLBACK?
  // If any tools are active, check if they have a special reason for dealing with the event.
  if (activeTools.length > 0) {
    // TODO: If length > 1, you could assess fitness and select the ideal tool
    // TODO: But because we're locking this to 'active' tools, that should rarely be an issue
    // Super-Meta-TODO: ^ I think we should just take the approach of one active tool per mouse button?
    const firstActiveToolWithCallback = activeTools.find(
      (tool) => typeof tool.postMouseDownCallback === 'function'
    );

    if (firstActiveToolWithCallback) {
      const consumedEvent = firstActiveToolWithCallback.postMouseDownCallback(
        evt
      );

      if (consumedEvent) {
        return;
      }
    }
  }
}
