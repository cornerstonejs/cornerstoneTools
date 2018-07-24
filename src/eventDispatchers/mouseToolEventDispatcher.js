import EVENTS from './../events.js';
import external from './../externalModules.js';
// State
import { getters } from './../store/index.js';
import { addToolState, getToolState } from './../stateManagement/toolState.js';
import toolCoordinates from './../stateManagement/toolCoordinates.js';
// Manipulators
import getHandleNearImagePoint from './../manipulators/getHandleNearImagePoint.js';
import handleActivator from './../manipulators/handleActivator.js';
import moveAllHandles from './../manipulators/moveAllHandles.js';
import moveHandle from './../manipulators/moveHandle.js';
import moveNewHandle from '../manipulators/moveNewHandle.js';
// Util
import isMouseButtonEnabled from './../util/isMouseButtonEnabled.js';
// Todo: Where should these live?
import getActiveToolsForElement from './../store/getActiveToolsForElement.js';
import getInteractiveToolsForElement from './../store/getInteractiveToolsForElement.js';
import getToolsWithDataForElement from './../store/getToolsWithDataForElement.js';

const cornerstone = external.cornerstone;

// TODO: better place for this
let isAwaitingMouseUp = false;

/**
 * These listeners are emitted in order, and can be cancelled/prevented from bubbling
 * by any previous event.
 * - mouseMove: used to update the [un]hover state of a tool (highlighting)
 * - mouseDown: check to see if we are close to an existing annotation, grab it
 * - mouseDownActivate: createNewMeasurement (usually)
 * - mouseDrag: update measurement or apply strategy (wwwc)
 * - mouseDoubleClick: usually a one-time apply specialty action
 * - onImageRendered: redraw visible tool data
 * @param {*} element
 */
const enable = function (element) {
  console.log('enableMouseDispatcher:', element);
  element.addEventListener(EVENTS.MOUSE_MOVE, mouseMove);
  element.addEventListener(EVENTS.MOUSE_DOWN, mouseDown);
  element.addEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivate);
  element.addEventListener(EVENTS.MOUSE_DRAG, mouseDrag);
  element.addEventListener(EVENTS.MOUSE_DOUBLE_CLICK, mouseDoubleClick);
  element.addEventListener(EVENTS.MOUSE_WHEEL, mouseWheel);
  element.addEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
};

/**
 * This is mostly used to update the [un]hover state
 * of a tool.
 *
 * @param {*} evt
 */
function mouseMove (evt) {
  if (isAwaitingMouseUp) {
    return;
  }
  let tools;
  const eventData = evt.detail;
  const element = eventData.element;

  // What does this do?
  // Do we need this?
  toolCoordinates.setCoords(eventData);

  // TODO: instead of filtering these for every interaction, we can change our
  // State's structure to always know these values.
  // Filter out disabled and enabled
  tools = getInteractiveToolsForElement(element, getters.mouseTools());
  tools = getToolsWithDataForElement(element, tools);

  // Iterate over each tool, and each tool's data
  // Activate any handles we're hovering over, or whole tools if we're near the tool
  // If we've changed the state of anything, redrawn the image
  let imageNeedsUpdate = false;

  for (let t = 0; t < tools.length; t++) {
    const tool = tools[t];
    const coords = eventData.currentPoints.canvas;
    const toolState = getToolState(eventData.element, tool.name);

    for (let d = 0; d < toolState.data.length; d++) {
      const data = toolState.data[d];

      // Hovering a handle?
      if (handleActivator(eventData.element, data.handles, coords) === true) {
        imageNeedsUpdate = true;
      }

      // Tool data's 'active' does not match coordinates
      // TODO: can't we just do an if/else and save on a pointNearTool check?
      const nearToolAndNotMarkedActive =
        tool.pointNearTool(eventData.element, data, coords) && !data.active;
      const notNearToolAndMarkedActive =
        !tool.pointNearTool(eventData.element, data, coords) && data.active;

      if (nearToolAndNotMarkedActive || notNearToolAndMarkedActive) {
        data.active = !data.active;
        imageNeedsUpdate = true;
      }

      // Call the tool's mouseMoveCallback if it exists.
      if (typeof tool.mouseMoveCallback === 'function') {
        tool.mouseMoveCallback(evt);
      }

    }
  }

  // Tool data activation status changed, redraw the image
  if (imageNeedsUpdate === true) {
    cornerstone.updateImage(eventData.element);
  }
}

// Note: if we find a match, we need to record that we're holding down on a tool
// So we don't fire the mouse_move event listener
// On pick-up, we need to "release", so we can re-enable the mouse_move listener
/**
 * MouseDown is called before MouseDownActivate. If MouseDown
 * finds an existing tool to interact with, it can prevent the
 * event from bubbling to MouseDownActivate.
 *
 * @param {*} evt
 * @returns
 */
function mouseDown (evt) {
  if (isAwaitingMouseUp) {
    return;
  }
  console.log('mouseDown');

  let tools;
  const eventData = evt.detail;
  const element = eventData.element;
  const coords = eventData.currentPoints.canvas;
  const distance = 6;

  // TODO: instead of filtering these for every interaction, we can change our
  // State's structure to always know these values.
  // Filter out disabled and enabled
  tools = getInteractiveToolsForElement(element, getters.mouseTools());
  // Filter out tools that do not match mouseButtonMask
  tools = tools.filter((tool) =>
    isMouseButtonEnabled(eventData.which, tool.options.mouseButtonMask)
  );

  // Check if any tool has a special reason to grab the current event
  for (let t = 0; t < tools.length; t++) {

    if (typeof tools[t].mouseDownCallback === 'function' &&
        typeof tools[t].isValidTarget === 'function' &&
        tools[t].isValidTarget(eventData)) {
      tools[t].mouseDownCallback(evt);

      evt.stopImmediatePropagation();
      evt.stopPropagation();
      evt.preventDefault();

      return;
      }
  }

  tools = getToolsWithDataForElement(element, tools);

  // Find tools with handles we can move
  const toolsWithMoveableHandles = tools.filter((tool) => {
    const toolState = getToolState(eventData.element, tool.name);

    for (let i = 0; i < toolState.data.length; i++) {
      if (
        getHandleNearImagePoint(
          element,
          toolState.data[i].handles,
          coords,
          distance
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
    const activeTool = toolsWithMoveableHandles[0];

    const toolState = getToolState(
      eventData.element,
      activeTool.name
    );

    for (let i = 0; i < toolState.data.length; i++) {
      const data = toolState.data[i];
      const distance = 6;
      const handle = getHandleNearImagePoint(
        element,
        data.handles,
        coords,
        distance
      );

      // Use custom handler if it exists
      if (typeof activeTool.mouseDownCallback === 'function') {
        activeTool.mouseDownCallback(evt);
        evt.stopImmediatePropagation();
        evt.stopPropagation();
        evt.preventDefault();

        return;
      } else if (handle) {
        // Todo: We've grabbed a handle, stop listening/ignore for MOUSE_MOVE
        data.active = true;
        moveHandle(
          eventData,
          toolsWithMoveableHandles[0].name,
          data,
          handle,
          () => {}, // HandleDoneMove,
          true // PreventHandleOutsideImage
        );
        evt.stopImmediatePropagation();
        evt.stopPropagation();
        evt.preventDefault();

        return;
      }
    }
  }

  // None? Next.

  // First tool with a point near us
  // See if there is a tool we can move
  tools = tools.find((tool) => {
    const toolState = getToolState(eventData.element, tool.name);
    const opt = tool.options || {
      deleteIfHandleOutsideImage: true,
      preventHandleOutsideImage: false
    };

    for (let i = 0; i < toolState.data.length; i++) {
      const data = toolState.data[i];

      data.active = false;
      if (tool.pointNearTool && tool.pointNearTool(element, data, coords)) {
        data.active = true;
        // Todo: ignore MOUSE_MOVE for a bit
        moveAllHandles(
          evt,
          data,
          toolState,
          tool.name,
          opt,
          () => {} /* HandleDoneMove */
        );

        evt.stopImmediatePropagation();
        evt.stopPropagation();
        evt.preventDefault();

        return;
      }
    }
  });

  // Function handleDoneMove () {
  //   Data.invalidated = true;
  //   If (anyHandlesOutsideImage(eventData, data.handles)) {
  // 	// Delete the measurement
  // 	RemoveToolState(element, toolType, data);
  //   }

  //   External.cornerstone.updateImage(element);
  //   Element.addEventListener(EVENTS.MOUSE_MOVE, mouseMove);
  // }
}

// Tools like wwwc. Non-annotation tools w/ specific
// Down + mouse behavior
// TODO: I don't like filtering in drag because it's such
// A high frequency event. Anything we can do to reduce
// Repeat math here would be a big help
function mouseDrag (evt) {
  if (isAwaitingMouseUp) {
    return;
  }
  console.log('mouseDrag');

  let tools;
  const eventData = evt.detail;
  const element = eventData.element;

  // Filter out disabled, enabled, and passive
  tools = getActiveToolsForElement(element, getters.mouseTools());
  tools = tools.filter((tool) =>
    isMouseButtonEnabled(eventData.which, tool.options.mouseButtonMask)
  );
  tools = tools.filter((tool) => typeof tool.mouseDragCallback === 'function');

  if (tools.length === 0) {
    return;
  }

  const activeTool = tools[0];

  activeTool.mouseDragCallback(evt);
}

// Todo: We could simplify this if we only allow one active
// Tool per mouse button mask?
function mouseDownActivate (evt) {
  if (isAwaitingMouseUp) {
    return;
  }
  console.log('mouseDownActivate');

  const eventData = evt.detail;
  const element = eventData.element;

  // Filter out disabled, enabled, and passive
  let tools = getActiveToolsForElement(element, getters.mouseTools());

  // Filter out tools that do not match mouseButtonMask
  tools = tools.filter((tool) =>
    isMouseButtonEnabled(eventData.which, tool.options.mouseButtonMask)
  );

  if (tools.length === 0) {
    return;
  }

  const activeTool = tools[0];

  // Note: custom `addNewMeasurement` will need to prevent event bubbling
  if (activeTool.addNewMeasurement) {
    activeTool.addNewMeasurement(evt, 'mouse');
  } else if (activeTool.isAnnotationTool) {
    addNewMeasurement(evt, activeTool);
  }
}

function mouseDoubleClick (evt) {
  if (isAwaitingMouseUp) {
    return;
  }
  console.warn('mouseDoubleClick');

  let tools;
  const eventData = evt.detail;
  const element = eventData.element;

  // Filter out disabled, enabled, and passive
  tools = getActiveToolsForElement(element, getters.mouseTools());
  tools = tools.filter((tool) =>
    isMouseButtonEnabled(eventData.which, tool.options.mouseButtonMask)
  );
  tools = tools.filter((tool) => typeof tool.mouseDoublClickCallback === 'function');

  if (tools.length === 0) {
    return;
  }

  const activeTool = tools[0];

  activeTool.mouseDoublClickCallback(evt);
}

function mouseWheel (evt) {
  if (isAwaitingMouseUp) {
    return;
  }
  console.log('mouseWheel');

  let tools;
  const element = evt.detail.element;

  // Filter out disabled, enabled, and passive
  tools = getActiveToolsForElement(element, getters.mouseTools());
  tools = tools.filter((tool) => typeof tool.mouseWheelCallback === 'function');

  if (tools.length === 0) {
    return;
  }

  tools[0].mouseWheelCallback(evt);
}

function onImageRendered (evt) {
  const eventData = evt.detail;
  const element = eventData.element;

  const toolsToRender = getters.
    mouseTools().
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
  //
  evt.preventDefault();
  evt.stopPropagation();
  const mouseEventData = evt.detail;
  const element = mouseEventData.element;
  const measurementData = tool.createNewMeasurement(mouseEventData);

  if (!measurementData) {
    return;
  }

  // Associate this data with this imageId so we can render it and manipulate it
  addToolState(element, tool.name, measurementData);

  isAwaitingMouseUp = true;
  cornerstone.updateImage(element);

  let handleMover;

  if (Object.keys(measurementData.handles).length === 1) {
    handleMover = moveHandle;
  } else {
    handleMover = moveNewHandle;
  }

  let preventHandleOutsideImage;

  if (tool.options && tool.options.preventHandleOutsideImage !== undefined) {
    preventHandleOutsideImage = tool.options.preventHandleOutsideImage;
  } else {
    preventHandleOutsideImage = false;
  }

  handleMover(
    mouseEventData,
    tool.name,
    measurementData,
    measurementData.handles.end,
    // On mouse up
    function () {
      console.log('addNewMeasurement: mouseUp');
      measurementData.active = false;
      measurementData.invalidated = true;
      //   If (anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
      //     // Delete the measurement
      //     RemoveToolState(element, toolType, measurementData);
      //   }

      isAwaitingMouseUp = false;
      cornerstone.updateImage(element);
    },
    preventHandleOutsideImage
  );
}

function setIsAwaitingMouseUp (bool) {
  if (typeof bool === 'boolean') {
    isAwaitingMouseUp = bool;
  } else {
    throw new Error('Attempting to see mouseToolEventDispatcher.isAwaitingMouseUp to a non-boolean.');
  }
}

function getIsAwaitingMouseUp () {
  return isAwaitingMouseUp;
}

export default {
  enable,
  getIsAwaitingMouseUp,
  setIsAwaitingMouseUp
  // Disable
};
