import EVENTS from '../../events.js';
import external from '../../externalModules.js';
// State
import { getters, state } from '../../store/index.js';
// Import anyHandlesOutsideImage from '../manipulators/anyHandlesOutsideImage.js';
import getHandleNearImagePoint from '../../manipulators/getHandleNearImagePoint.js';
import touchMoveHandle from '../../manipulators/touchMoveHandle.js';
import touchMoveAllHandles from '../../manipulators/touchMoveAllHandles.js';
import { getToolState } from '../../stateManagement/toolState.js';
import triggerEvent from '../../util/triggerEvent.js';
// Todo: Where should these live?
import getInteractiveToolsForElement from '../../store/getInteractiveToolsForElement.js';
import getToolsWithDataForElement from '../../store/getToolsWithDataForElement.js';

export default function (evt) {
  console.log('touchStart');
  if (state.isToolLocked) {
    return;
  }

  const distanceFromHandle = 28;
  const eventData = evt.detail;
  const element = eventData.element;
  const coords = eventData.startPoints.canvas;

  let tools = getInteractiveToolsForElement(element, getters.touchTools());

  tools = tools.filter((tool) => tool.options.isTouchActive);
  const activeTools = tools.filter((tool) => tool.mode === 'active');

  // If any tools are active, check if they have a special reason for dealing with the event.
  if (activeTools.length > 0) {
    // TODO: If length > 1, you could assess fitness and select the ideal tool
    // TODO: But because we're locking this to 'active' tools, that should rarely be an issue
    // Super-Meta-TODO: ^ I think we should just take the approach of one active tool per mouse button?
    const firstActiveToolWithCallback = activeTools.find(
      (tool) => typeof tool.preTouchStartCallback === 'function'
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

  const annotationTools = getToolsWithDataForElement(element, tools);

  // Find all tools w/ handles that we are near
  const annotationToolsWithMoveableHandles = annotationTools.filter((tool) => {
    const toolState = getToolState(element, tool.name);

    for (let i = 0; i < toolState.data.length; i++) {
      if (
        getHandleNearImagePoint(
          eventData.element,
          toolState.data[i].handles,
          coords,
          distanceFromHandle
        ) !== undefined
      ) {
        return true;
      }
    }

    return false;
  });

  console.log('toolsWithMoveableHandles: ', annotationToolsWithMoveableHandles);

  // TODO: More than one? Which one was moved most recently?
  // We'll just grab the first one we encounter for now
  if (annotationToolsWithMoveableHandles.length > 0) {
    // Todo: Ignore TAP, START, PRESS

    const firstToolWithMoveableHandles = annotationToolsWithMoveableHandles[0];
    const toolState = getToolState(element, firstToolWithMoveableHandles.name);
    const dataWithMoveableHandle = toolState.data.find(
      (d) =>
        getHandleNearImagePoint(
          element,
          d.handles,
          coords,
          distanceFromHandle
        ) !== undefined
    );
    const moveableHandle = getHandleNearImagePoint(
      element,
      dataWithMoveableHandle.handles,
      coords,
      distanceFromHandle
    );

    console.log('moveableHandle: ', moveableHandle);

    dataWithMoveableHandle.active = true;
    touchMoveHandle(
      evt,
      firstToolWithMoveableHandles.name,
      dataWithMoveableHandle,
      moveableHandle,
      () => {
        console.log('touchMoveHandle: DONE');
      } // HandleDoneMove
    );

    evt.stopImmediatePropagation();
    evt.preventDefault();
    evt.stopPropagation();

    return;
  }

  // Find all tools near our point
  const annotationToolsWithPointNearTouch = annotationTools.filter((tool) => {
    const toolState = getToolState(element, tool.name);
    const isNearPoint =
      tool.pointNearTool &&
      toolState.data.some((data) => tool.pointNearTool(element, data, coords));

    return isNearPoint;
  });

  // TODO: More than one? Which one was moved most recently?
  // We'll just grab the first one we encounter for now
  if (annotationToolsWithPointNearTouch.length > 0) {
    // Todo: Ignore: TAP, START, PRESS
    const firstToolNearPoint = annotationToolsWithPointNearTouch[0];
    const toolState = getToolState(element, firstToolNearPoint.name);
    const firstAnnotationNearPoint = toolState.data.find((data) =>
      firstToolNearPoint.pointNearTool(element, data, coords)
    );

    touchMoveAllHandles(
      evt,
      firstAnnotationNearPoint,
      toolState,
      firstToolNearPoint.name,
      true,
      (lastEvent, lastEventData) => {
        firstAnnotationNearPoint.active = false;
        firstAnnotationNearPoint.invalidated = true;
        //   If (anyHandlesOutsideImage(eventData, data.handles)) {
        //     // Delete the measurement
        //     RemoveToolState(
        //       EventData.element,
        //       TouchToolInterface.toolType,
        //       Data
        //     );
        //   }

        external.cornerstone.updateImage(element);
        // Todo: LISTEN: TAP, START, PRESS

        if (lastEvent && lastEvent.type === EVENTS.TOUCH_PRESS) {
          triggerEvent(element, lastEvent.type, lastEventData);
        }
      }
    );
    evt.stopImmediatePropagation();
    evt.preventDefault();
    evt.stopPropagation();

    return;
  }

  // If any tools are active, check if they have a special reason for dealing with the event.
  if (activeTools.length > 0) {
    // TODO: If length > 1, you could assess fitness and select the ideal tool
    // TODO: But because we're locking this to 'active' tools, that should rarely be an issue
    // Super-Meta-TODO: ^ I think we should just take the approach of one active tool per mouse button?
    const firstActiveToolWithCallback = activeTools.find(
      (tool) => typeof tool.postTouchStartCallback === 'function'
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
