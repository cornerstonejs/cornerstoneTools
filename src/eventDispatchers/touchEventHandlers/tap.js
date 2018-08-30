import external from '../../externalModules.js';
import touchStartActive from './touchStartActive.js';
// State
import { getters, state } from '../../store/index.js';
import getActiveToolsForElement from '../../store/getActiveToolsForElement.js';
import getToolsWithDataForElement from '../../store/getToolsWithDataForElement.js';
import { getToolState } from '../../stateManagement/toolState.js';
//
import getHandleNearImagePoint from '../../manipulators/getHandleNearImagePoint.js';
import touchMoveHandle from '../../manipulators/touchMoveHandle.js';
import touchMoveAllHandles from '../../manipulators/touchMoveAllHandles.js';
//
import deactivateAllToolInstances from './shared/deactivateAllToolInstances.js';


export default function (evt) {
  if (state.isToolLocked) {
    return;
  }
  console.log('tap');

  let tools;
  const distanceFromHandle = 28;
  const element = evt.detail.element;
  const coords = evt.detail.currentPoints.canvas;

  tools = getActiveToolsForElement(element, getters.touchTools());
  tools = getToolsWithDataForElement(element, tools);

  // Deactivate everything
  // DeactivateAllToolInstances(toolData);

  // Find all tools w/ handles that we are near
  const toolsWithMoveableHandles = tools.filter((tool) => {
    const toolState = getToolState(element, tool.name);

    for (let i = 0; i < toolState.data.length; i++) {
      if (
        getHandleNearImagePoint(
          element,
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

  // TODO: More than one? Which one was moved most recently?
  // We'll just grab the first one we encounter for now
  if (toolsWithMoveableHandles.length > 0) {
    // Todo: ignore: touch_start, tap

    const firstToolWithMoveableHandles = toolsWithMoveableHandles[0];
    const toolState = getToolState(element, firstToolWithMoveableHandles.name);
    const moveableHandle = toolState.data.find(
      (d) =>
        getHandleNearImagePoint(
          element,
          d.handles,
          coords,
          distanceFromHandle
        ) !== undefined
    );

    toolState.data.active = true;
    moveableHandle.active = true; // Why here, but not touchStart?
    external.cornerstone.updateImage(element);

    touchMoveHandle(
      evt,
      firstToolWithMoveableHandles.name,
      toolState.data,
      moveableHandle,
      () => {
        deactivateAllToolInstances(toolState);
        // If (anyHandlesOutsideImage(eventData, data.handles)) {
        //   // Delete the measurement
        //   RemoveToolState(element, touchToolInterface.toolType, data);
        // }

        external.cornerstone.updateImage(element);
        // TODO: LISTEN: TAP + TOUCH_START
      }
    );
    evt.stopImmediatePropagation();
    evt.preventDefault();
    // Why no stopPropagation?

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

    // Todo: ignore: touch_start, tap
    firstAnnotationNearPoint.active = true;
    external.cornerstone.updateImage(element);

    touchMoveAllHandles(
      evt,
      firstAnnotationNearPoint,
      toolState,
      firstToolNearPoint.name,
      true,
      () => {
        deactivateAllToolInstances(toolState);
        // If (anyHandlesOutsideImage(eventData, data.handles)) {
        //   // Delete the measurement
        //   RemoveToolState(element, touchToolInterface.toolType, data);
        // }

        external.cornerstone.updateImage(element);
        // TODO: LISTEN: TAP + TOUCH_START
      }
    );
    evt.stopImmediatePropagation();
    evt.preventDefault();
    // Why no stop propagation?

    return;
  }

  // If there is nothing to move, add a new instance of the tool
  // Need to check here to see if activation is allowed!
  // TODO: What would this be? First active tool?
  // Or should _always_ pass through to our larger event handler that checks
  // All tools anyway?
  const allActiveTools = getActiveToolsForElement(
    element,
    getters.touchTools()
  );

  if (allActiveTools.length > 0 && allActiveTools[0].touchStartActiveCallback) {
    allActiveTools[0].touchStartActiveCallback(evt);
  } else {
    touchStartActive(evt);
  }

  return false;
}
