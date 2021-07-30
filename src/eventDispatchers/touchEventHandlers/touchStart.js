// State
import { getters, state } from '../../store/index.js';
import { findHandleDataNearImagePoint } from '../../util/findAndMoveHelpers.js';
import getToolsWithMoveableHandles from '../../store/getToolsWithMoveableHandles.js';
import { getToolState } from './../../stateManagement/toolState.js';
import getInteractiveToolsForElement from './../../store/getInteractiveToolsForElement.js';
import getToolsWithDataForElement from './../../store/getToolsWithDataForElement.js';
import filterToolsUseableWithMultiPartTools from './../../store/filterToolsUsableWithMultiPartTools.js';

export default function(evt) {
  if (state.isToolLocked) {
    return;
  }

  const eventData = evt.detail;
  const element = eventData.element;
  const coords = eventData.startPoints.canvas;

  const activeAndPassiveTools = getInteractiveToolsForElement(
    element,
    getters.touchTools()
  );

  let activeTools = activeAndPassiveTools.filter(
    tool => tool.mode === 'active' && tool.options.isTouchActive
  );

  if (state.isMultiPartToolActive) {
    activeTools = filterToolsUseableWithMultiPartTools(activeTools);
  }

  // If any tools are active, check if they have a special reason for dealing with the event.
  if (activeTools.length > 0) {
    // TODO: If length > 1, you could assess fitness and select the ideal tool
    // TODO: But because we're locking this to 'active' tools, that should rarely be an issue
    // Super-Meta-TODO: ^ I think we should just take the approach of one active tool per mouse button?
    const firstActiveToolWithCallback = activeTools.find(
      tool => typeof tool.preTouchStartCallback === 'function'
    );

    if (firstActiveToolWithCallback) {
      const consumedEvent = firstActiveToolWithCallback.preTouchStartCallback(
        evt
      );

      if (consumedEvent) {
        return;
      }
    }
  }

  if (state.isMultiPartToolActive) {
    return;
  }

  const annotationTools = getToolsWithDataForElement(
    element,
    activeAndPassiveTools
  );

  // NEAR HANDLES?
  const annotationToolsWithMoveableHandles = getToolsWithMoveableHandles(
    element,
    annotationTools,
    coords,
    'touch'
  );

  // TODO: More than one? Which one was moved most recently?
  // We'll just grab the first one we encounter for now
  if (annotationToolsWithMoveableHandles.length > 0) {
    // Todo: Ignore TAP, START, PRESS

    const firstToolWithMoveableHandles = annotationToolsWithMoveableHandles[0];
    const toolState = getToolState(element, firstToolWithMoveableHandles.name);

    const { handle, data } = findHandleDataNearImagePoint(
      element,
      toolState,
      firstToolWithMoveableHandles.name,
      coords,
      'touch'
    );

    firstToolWithMoveableHandles.handleSelectedCallback(
      evt,
      data,
      handle,
      'touch'
    );

    return;
  }

  // NEAR POINT?
  const annotationToolsWithPointNearTouch = annotationTools.filter(tool => {
    const toolState = getToolState(element, tool.name);
    const isNearPoint =
      toolState &&
      toolState.data &&
      tool.pointNearTool &&
      toolState.data.some(data =>
        tool.pointNearTool(element, data, coords, 'touch')
      );

    return isNearPoint;
  });

  // TODO: More than one? Which one was moved most recently?
  // We'll just grab the first one we encounter for now
  if (annotationToolsWithPointNearTouch.length > 0) {
    // Todo: Ignore: TAP, START, PRESS
    const firstToolNearPoint = annotationToolsWithPointNearTouch[0];
    const toolState = getToolState(element, firstToolNearPoint.name);
    const firstAnnotationNearPoint = toolState.data.find(data =>
      firstToolNearPoint.pointNearTool(element, data, coords)
    );

    firstToolNearPoint.toolSelectedCallback(
      evt,
      firstAnnotationNearPoint,
      'touch'
    );

    return;
  }

  // If any tools are active, check if they have a special reason for dealing with the event.
  if (activeTools.length > 0) {
    // TODO: If length > 1, you could assess fitness and select the ideal tool
    // TODO: But because we're locking this to 'active' tools, that should rarely be an issue
    // Super-Meta-TODO: ^ I think we should just take the approach of one active tool per mouse button?
    const firstActiveToolWithCallback = activeTools.find(
      tool => typeof tool.postTouchStartCallback === 'function'
    );

    if (firstActiveToolWithCallback) {
      const consumedEvent = firstActiveToolWithCallback.postTouchStartCallback(
        evt
      );

      if (consumedEvent) {
        return;
      }
    }
  }
}
