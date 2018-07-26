import EVENTS from './../../events.js';
import external from './../../externalModules.js';
// State
import { getters, state } from './../../store/index.js';
// Import anyHandlesOutsideImage from '../manipulators/anyHandlesOutsideImage.js';
import getHandleNearImagePoint from './../../manipulators/getHandleNearImagePoint.js';
import touchMoveHandle from './../../manipulators/touchMoveHandle.js';
import touchMoveAllHandles from './../../manipulators/touchMoveAllHandles.js';
import { getToolState } from './../../stateManagement/toolState.js';
import triggerEvent from './../../util/triggerEvent.js';
// Todo: Where should these live?
import getInteractiveToolsForElement from './../../store/getInteractiveToolsForElement.js';
import getToolsWithDataForElement from './../../store/getToolsWithDataForElement.js';

const cornerstone = external.cornerstone;

export default function (evt) {
  console.log('touchStart');
  if (state.isToolLocked) {
    return;
  }

  let tools;
  const distanceFromHandle = 28;
  const eventData = evt.detail;
  const element = eventData.element;
  const coords = eventData.startPoints.canvas;

  tools = getInteractiveToolsForElement(element, getters.touchTools());
  tools = getToolsWithDataForElement(element, tools);

  // Find all tools w/ handles that we are near
  const toolsWithMoveableHandles = tools.filter((tool) => {
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

  console.log('toolsWithMoveableHandles: ', toolsWithMoveableHandles);

  // TODO: More than one? Which one was moved most recently?
  // We'll just grab the first one we encounter for now
  if (toolsWithMoveableHandles.length > 0) {
    // Todo: Ignore TAP, START, PRESS

    const firstToolWithMoveableHandles = toolsWithMoveableHandles[0];
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

    toolState.data.active = true;
    touchMoveHandle(
      evt,
      firstToolWithMoveableHandles.name,
      toolState.data,
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
  const toolsNearPoint = tools.filter((tool) => {
    const toolState = getToolState(element, tool.name);
    const isNearPoint =
      tool.pointNearTool &&
      toolState.data.some((data) => tool.pointNearTool(element, data, coords));

    return isNearPoint;
  });

  // TODO: More than one? Which one was moved most recently?
  // We'll just grab the first one we encounter for now
  if (toolsNearPoint.length > 0) {
    // Todo: Ignore: TAP, START, PRESS
    const firstToolNearPoint = toolsNearPoint[0];
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

        cornerstone.updateImage(element);
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
}
