import EVENTS from '../events.js';
import external from '../externalModules.js';
// State
import { getters } from './../store/index.js';
// Import anyHandlesOutsideImage from '../manipulators/anyHandlesOutsideImage.js';
import getHandleNearImagePoint from '../manipulators/getHandleNearImagePoint.js';
import touchMoveHandle from '../manipulators/touchMoveHandle.js';
import moveNewHandleTouch from '../manipulators/moveNewHandleTouch.js';
import touchMoveAllHandles from '../manipulators/touchMoveAllHandles.js';
import {
  addToolState,
  // RemoveToolState,
  getToolState
} from '../stateManagement/toolState.js';
import triggerEvent from '../util/triggerEvent.js';
// Todo: Where should these live?
import getActiveToolsForElement from './../store/getActiveToolsForElement.js';
import getInteractiveToolsForElement from './../store/getInteractiveToolsForElement.js';
import getToolsWithDataForElement from './../store/getToolsWithDataForElement.js';

const cornerstone = external.cornerstone;
// Todo: better place for this
// Tap, Start, StartActive
let isAwaitingTouchUp = false;

/**
 * These listeners are emitted in order, and can be cancelled/prevented from bubbling
 * by any previous event.
 * - tap:
 * - touchStart: check to see if we are close to an existing annotation, grab it
 * - touchDrag:
 * - touchStartActive: createNewMeasurement (usually)
 * - touchPress:
 * - doubleTap: usually a one-time apply specialty action
 * - onImageRendered: redraw visible tool data
 * @param {*} element
 */
const enable = function (element) {
  console.log('enableTouch', element);
  element.addEventListener(EVENTS.TAP, tap);
  element.addEventListener(EVENTS.TOUCH_START, touchStart);
  element.addEventListener(EVENTS.TOUCH_DRAG, touchDrag);
  element.addEventListener(EVENTS.TOUCH_END, touchEnd);
  // Mouse equivelant is `mouse_down_activate`
  // Should the naming pattern here match?
  element.addEventListener(EVENTS.TOUCH_START_ACTIVE, touchStartActive);
  element.addEventListener(EVENTS.TOUCH_PRESS, touchPress);
  element.addEventListener(EVENTS.DOUBLE_TAP, doubleTap);
  element.addEventListener(EVENTS.TOUCH_PINCH, touchPinch);
  element.addEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
};

function tap (evt) {
  console.log('tap');
  if (isAwaitingTouchUp) {
    return;
  }

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
    cornerstone.updateImage(element);

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

        cornerstone.updateImage(element);
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
    cornerstone.updateImage(element);

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

        cornerstone.updateImage(element);
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

function touchStart (evt) {
  console.log('touchStart');
  if (isAwaitingTouchUp) {
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

  // TODO: More than one? Which one was moved most recently?
  // We'll just grab the first one we encounter for now
  if (toolsWithMoveableHandles.length > 0) {
    // Todo: Ignore TAP, START, PRESS

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
    touchMoveHandle(
      evt,
      firstToolWithMoveableHandles.name,
      toolState.data,
      moveableHandle,
      () => {} // HandleDoneMove
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

// TODO:
// Note: some touchDrag tools don't want to fire on touchStart
// Drag tools have an option `fireOnTouchStart` used to filter
// Them out of TOUCH_START handler
// Active: dragTool only
// Or tool has `touchDragCallback` method
function touchDrag (evt) {
  console.log('touchDrag');

  let tools;
  const element = evt.detail.element;

  tools = getActiveToolsForElement(element, getters.touchTools());
  tools = tools.filter((tool) => typeof tool.touchDragCallback === 'function');

  if (tools.length === 0) {
    return;
  }
  const firstActiveTool = tools[0];

  firstActiveTool.touchDragCallback(evt);
}

// Active: dragTool only
// Or tool has `touchEndCallbach` method
function touchEnd (evt) {
  console.log('touchEnd');
}

function touchStartActive (evt) {
  console.log('touchStartActive');
  if (isAwaitingTouchUp) {
    return;
  }

  const element = evt.detail.element;
  const tools = getActiveToolsForElement(element, getters.touchTools());
  const activeTool = tools[0];

  // Note: custom `addNewMeasurement` will need to prevent event bubbling
  if (activeTool.addNewMeasurement) {
    activeTool.addNewMeasurement(evt, 'touch');
  } else if (activeTool.isAnnotationTool) {
    addNewMeasurement(evt, activeTool);
  }
}

function touchPress (evt) {
  // Active?
  console.warn('touchPress not implemented');
}

function doubleTap (evt) {
  // Active?
  console.warn('doubleTap not implemented');
}

function touchPinch (evt) {
  console.log('touchPinch');
  if (isAwaitingTouchUp) {
    return;
  }

  let tools;
  const element = evt.detail.element;

  // Filter out disabled, enabled, and passive
  tools = getActiveToolsForElement(element, getters.touchTools());
  tools = tools.filter((tool) => typeof tool.touchPinchCallback === 'function');

  if (tools.length === 0) {
    return;
  }

  tools[0].touchPinchCallback(evt);
}

function onImageRendered (evt) {
  const eventData = evt.detail;
  const element = eventData.element;

  const toolsToRender = getters.
    touchTools().
    filter(
      (tool) =>
        tool.element === element &&
        (tool.mode === 'active' ||
          tool.mode === 'passive' ||
          tool.mode === 'enabled')
    );

  toolsToRender.forEach((tool) => {
    if (tool.renderToolData) {
      tool.renderToolData(evt);
    }
  });
}

function addNewMeasurement (evt, tool) {
  console.log('touch: addNewMeasurement');
  //
  evt.preventDefault();
  evt.stopPropagation();
  //
  const touchEventData = evt.detail;
  const element = touchEventData.element;
  const measurementData = tool.createNewMeasurement(touchEventData);

  if (!measurementData) {
    return;
  }

  addToolState(element, tool.name, measurementData);

  // Todo: Looks like we're handling the "up" of the tap?
  if (
    Object.keys(measurementData.handles).length === 1 &&
    touchEventData.type === EVENTS.TAP
  ) {
    // Todo: bold assumptions about measurement data for all tools?
    measurementData.active = false;
    measurementData.handles.end.active = false;
    measurementData.handles.end.highlight = false;
    measurementData.invalidated = true;

    // TODO: IFF the tool supports this feature
    // If (anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
    //   // Delete the measurement
    //   RemoveToolState(element, tool.name, measurementData);
    // }

    cornerstone.updateImage(element);

    return;
  }

  isAwaitingTouchUp = true;
  cornerstone.updateImage(element);

  moveNewHandleTouch(
    touchEventData,
    tool.name,
    measurementData,
    measurementData.handles.end,
    function () {
      console.log('addNewMeasurement: touchUp');
      measurementData.active = false;
      measurementData.invalidated = true;
      //   If (anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
      //     // Delete the measurement
      //     RemoveToolState(element, touchToolInterface.toolType, measurementData);
      //   }

      isAwaitingTouchUp = false;
      cornerstone.updateImage(element);
    }
  );
}

export default {
  enable
  // Disable
};

// HELPER - UTILITY
function deactivateAllHandles (handles) {
  Object.keys(handles).forEach(function (name) {
    const handle = handles[name];

    handle.active = false;
  });
}

function deactivateAllToolInstances (toolData) {
  if (!toolData) {
    return;
  }

  for (let i = 0; i < toolData.data.length; i++) {
    const data = toolData.data[i];

    data.active = false;
    if (!data.handles) {
      continue;
    }

    deactivateAllHandles(data.handles);
  }
}
