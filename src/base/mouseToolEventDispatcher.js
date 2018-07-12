import EVENTS from './../events.js';
import external from './../externalModules.js';
// State
import { state } from './../store/index.js';
import { addToolState, getToolState } from './../stateManagement/toolState.js';
import toolCoordinates from './../stateManagement/toolCoordinates.js';
// Manipulators
import getHandleNearImagePoint from './../manipulators/getHandleNearImagePoint.js';
import moveAllHandles from './../manipulators/moveAllHandles.js';
import moveHandle from './../manipulators/moveHandle.js';
import moveNewHandle from '../manipulators/moveNewHandle.js';
// Util
import isMouseButtonEnabled from './../util/isMouseButtonEnabled.js';

const cornerstone = external.cornerstone;

// Todo: better place for this
let isAwaitingMouseUp = false;

const getActiveToolsForElement = function (element, tools) {
  return tools.filter(
    (tool) => tool.element === element && tool.mode === 'active'
  );
};

const getInteractiveToolsForElement = function (element, tools) {
  return tools.filter(
    (tool) =>
      tool.element === element &&
      (tool.mode === 'active' || tool.mode === 'passive')
  );
};

const enable = function (element) {
  console.log('enable', element);
  element.addEventListener(EVENTS.MOUSE_MOVE, mouseMove);
  element.addEventListener(EVENTS.MOUSE_DOWN, mouseDown);
  element.addEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivate);
  element.addEventListener(EVENTS.MOUSE_DOUBLE_CLICK, mouseDoubleClick);
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
  console.log('mouseMove');
  const eventData = evt.detail;
  const element = eventData.element;

  // What does this do?
  // Do we need this?
  toolCoordinates.setCoords(eventData);

  // TODO: instead of filtering these for every interaction, we can change our
  // State's structure to always know these values.
  // Filter out disabled and enabled
  let tools = getInteractiveToolsForElement(element, state.tools);

  // Filter out tools w/ no data
  tools = tools.filter((tool) => {
    const toolState = getToolState(eventData.element, tool.name);

    return toolState && toolState.length > 0;
  });

  // Find closest or most recently touched tool?
  // - Iterate over each tool's data?
  // - Use new distanceFromTool method on baseAnnotationTool (if it exist?)
  // Use closest or most recently touched w/ handleActivator and/or pointNearTool
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
  const eventData = evt.detail;
  const element = eventData.element;
  const coords = eventData.currentPoints.canvas;
  const distance = 6;

  // TODO: instead of filtering these for every interaction, we can change our
  // State's structure to always know these values.
  // Filter out disabled and enabled
  let tools = getInteractiveToolsForElement(element, state.tools);

  // Filter out tools that do not match mouseButtonMask
  tools = tools.filter((tool) =>
    isMouseButtonEnabled(eventData.which, tool.options.mouseButtonMask)
  );

  // Filter out tools w/ no data
  tools = tools.filter((tool) => {
    const toolState = getToolState(eventData.element, tool.name);

    return toolState && toolState.length > 0;
  });

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
    const toolState = getToolState(
      eventData.element,
      toolsWithMoveableHandles[0].name
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

      if (handle) {
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

// Todo: We could simplify this if we only allow one active
// Tool per mouse button mask?
function mouseDownActivate (evt) {
  if (isAwaitingMouseUp) {
    return;
  }
  console.log('mouseDownActivate');
  const eventData = evt.detail;
  const element = eventData.element;

  // Filter out disabled and enabled
  let tools = getActiveToolsForElement(element, state.tools);

  console.log('activeTools', tools);

  // Filter out tools that do not match mouseButtonMask
  tools = tools.filter((tool) =>
    isMouseButtonEnabled(eventData.which, tool.options.mouseButtonMask)
  );
  console.log('activeTools for mouse button', tools);

  if (tools.length === 0) {
    return;
  }

  const activeTool = tools[0];

  if (activeTool.addNewMeasurement) {
    activeTool.addNewMeasurement(eventData, activeTool);
  } else {
    addNewMeasurement(eventData, activeTool);
  }

  evt.preventDefault();
  evt.stopPropagation();
}

function mouseDoubleClick () {}

function onImageRendered (evt) {
  const eventData = evt.detail;
  const element = eventData.element;

  const toolsToRender = state.tools.filter(
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

// Export default function (mouseToolInterface) {
//   Let configuration = {};
//   Const toolType = mouseToolInterface.toolType;

//   Const mouseMove = mouseToolInterface.mouseMoveCallback || mouseMoveCallback;
//   Const mouseDown = mouseToolInterface.mouseDownCallback || mouseDownCallback;
//   Const mouseDownActivate =
//     MouseToolInterface.mouseDownActivateCallback || mouseDownActivateCallback;
//   Const mouseDoubleClick = mouseToolInterface.mouseDoubleClickCallback;

function addNewMeasurement (mouseEventData, tool) {
  const element = mouseEventData.element;
  const measurementData = tool.createNewMeasurement(mouseEventData);

  if (!measurementData) {
    return;
  }

  // Associate this data with this imageId so we can render it and manipulate it
  addToolState(mouseEventData.element, tool.name, measurementData);

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

export default {
  enable
  // Disable
};
