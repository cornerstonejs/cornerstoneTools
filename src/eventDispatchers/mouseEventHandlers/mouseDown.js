// State
import { getters, state } from './../../store/index.js';
import { getToolState } from './../../stateManagement/toolState.js';
// Util
import getToolsWithMoveableHandles from '../../store/getToolsWithMoveableHandles.js';
import {
  findHandleDataNearImagePoint,
  findAnnotationNearClick,
} from '../../util/findAndMoveHelpers.js';
// Todo: Where should these live?
import getInteractiveToolsForElement from './../../store/getInteractiveToolsForElement.js';
import getToolsWithDataForElement from './../../store/getToolsWithDataForElement.js';

/**
 * MouseDown is called before MouseDownActivate. If MouseDown
 * finds an existing tool to interact with, it can prevent the
 * event from bubbling to MouseDownActivate.
 *
 * TODO: Handles should handle deleting out of bound data by setting
 *
 * @private
 * @param {mousedown} evt
 * @listens {CornerstoneTools.event:cornerstonetoolsmousedown}
 * @returns {undefined}
 */
export default function(evt) {
  if (state.isToolLocked) {
    return;
  }

  const eventData = evt.detail;
  const element = evt.detail.element;
  const coords = evt.detail.currentPoints.canvas;

  // High level filtering
  const activeAndPassiveTools = getInteractiveToolsForElement(
    element,
    getters.mouseTools()
  );

  // ACTIVE TOOL W/ PRE CALLBACK?
  // Note: In theory, this should only ever be a single tool.
  const activeTools = activeAndPassiveTools.filter(
    tool =>
      tool.mode === 'active' &&
      tool.options.mouseButtonMask === eventData.buttons &&
      tool.options.isMouseActive
  );

  // If any tools are active, check if they have a special reason for dealing with the event.
  if (activeTools.length > 0) {
    // TODO: If length > 1, you could assess fitness and select the ideal tool
    // TODO: But because we're locking this to 'active' tools, that should rarely be an issue
    // Super-Meta-TODO: ^ I think we should just take the approach of one active tool per mouse button?
    const firstActiveToolWithCallback = activeTools.find(
      tool => typeof tool.preMouseDownCallback === 'function'
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
  const annotationTools = getToolsWithDataForElement(
    element,
    activeAndPassiveTools
  );

  // NEAR HANDLES?
  const annotationToolsWithMoveableHandles = getToolsWithMoveableHandles(
    element,
    annotationTools,
    coords,
    'mouse'
  );

  if (annotationToolsWithMoveableHandles.length > 0) {
    const firstToolWithMoveableHandles = annotationToolsWithMoveableHandles[0];
    const toolState = getToolState(element, firstToolWithMoveableHandles.name);

    const { handle, data } = findHandleDataNearImagePoint(
      element,
      toolState,
      firstToolWithMoveableHandles.name,
      coords
    );

    firstToolWithMoveableHandles.handleSelectedCallback(
      evt,
      handle,
      data,
      'mouse'
    );

    return;
  }

  // NEAR TOOL?
  const annotationToolsWithPointNearClick = activeAndPassiveTools.filter(
    tool => {
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
    }
  );

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
      tool => typeof tool.postMouseDownCallback === 'function'
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
