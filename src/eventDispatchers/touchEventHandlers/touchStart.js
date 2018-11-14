import EVENTS from '../../events.js';
import external from '../../externalModules.js';
// State
import { getters, state } from '../../store/index.js';
// Import anyHandlesOutsideImage from '../manipulators/anyHandlesOutsideImage.js';
import {
  findHandleDataNearImagePoint,
  findAnnotationNearClick,
} from '../../util/findAndMoveHelpers.js';
import getToolsWithMoveableHandles from '../../store/getToolsWithMoveableHandles.js';
import touchMoveAllHandles from './../../manipulators/touchMoveAllHandles.js';
import { getToolState } from './../../stateManagement/toolState.js';
import triggerEvent from './../../util/triggerEvent.js';
// Todo: Where should these live?
import getInteractiveToolsForElement from './../../store/getInteractiveToolsForElement.js';
import getToolsWithDataForElement from './../../store/getToolsWithDataForElement.js';

export default function(evt) {
  console.log('touchStart');
  if (state.isToolLocked) {
    return;
  }

  const distanceFromHandle = 28;
  const eventData = evt.detail;
  const element = eventData.element;
  const coords = eventData.startPoints.canvas;

  const activeAndPassiveTools = getInteractiveToolsForElement(
    element,
    getters.touchTools()
  );

  const activeTools = activeAndPassiveTools.filter(
    tool => tool.mode === 'active' && tool.options.isTouchActive
  );

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
      coords
    );

    firstToolWithMoveableHandles.handleSelectedCallback(
      evt,
      handle,
      data,
      'touch'
    );

    return;
  }

  // Find all tools near our point
  const annotationToolsWithPointNearTouch = annotationTools.filter(tool => {
    const toolState = getToolState(element, tool.name);
    const isNearPoint =
      tool.pointNearTool &&
      toolState.data.some(data => tool.pointNearTool(element, data, coords));

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
