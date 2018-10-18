/* jshint -W083 */
import external from '../../externalModules.js';
import EVENTS from '../../events.js';
import { toolType, distanceThreshold } from './definitions.js';
import mouseMoveCallback from './mouseMoveCallback.js';
import pointNearTool from './pointNearTool.js';
import { removeToolState, getToolState } from '../../stateManagement/toolState.js';
import anyHandlesOutsideImage from '../../manipulators/anyHandlesOutsideImage.js';
import getHandleNearImagePoint from '../../manipulators/getHandleNearImagePoint.js';
import moveAllHandles from '../../manipulators/moveAllHandles.js';
import moveHandle from './moveHandle/moveHandle.js';

// Clear the selected state for the given handles object
const unselectAllHandles = (handles) => {
  let imageNeedsUpdate = false;

  Object.keys(handles).forEach((handleKey) => {
    if (handleKey === 'textBox') {
      return;
    }
    handles[handleKey].selected = false;
    imageNeedsUpdate = handles[handleKey].active || imageNeedsUpdate;
    handles[handleKey].active = false;
  });

  return imageNeedsUpdate;
};

// Clear the bidirectional tool's selection for all tool handles
const clearBidirectionalSelection = (event) => {
  let imageNeedsUpdate = false;
  const toolData = getToolState(event.target, toolType);

  if (!toolData) {
    return;
  }
  toolData.data.forEach((data) => {
    const unselectResult = unselectAllHandles(data.handles);

    imageNeedsUpdate = imageNeedsUpdate || unselectResult;
  });

  return imageNeedsUpdate;
};

const setHandlesMovingState = (handles, state) => {
  Object.keys(handles).forEach((handleKey) => {
    if (handleKey === 'textBox') {
      return;
    }
    handles[handleKey].moving = state;
  });
};

// MouseDownCallback is used to restrict behaviour of perpendicular-line
export default function (event) {
  const eventData = event.detail;
  let data;
  const element = eventData.element;

  // Add an event listener to clear the selected state when a measurement is activated
  const activateEventKey = 'ViewerMeasurementsActivated';

  const activateEventKeyCallBack = () => clearBidirectionalSelection(event);

  element.removeEventListener(activateEventKey, activateEventKeyCallBack);
  element.addEventListener(activateEventKey, activateEventKeyCallBack);


  // Clear selection on left mouse button click
  if (eventData.which === 1) {
    const imageNeedsUpdate = clearBidirectionalSelection(event);

    if (imageNeedsUpdate) {
      external.cornerstone.updateImage(element);
    }
  }

  function handleDoneMove (handle) {
    data.invalidated = true;
    if (anyHandlesOutsideImage(eventData, data.handles)) {
      // Delete the measurement
      removeToolState(element, toolType, data);
    }

    // Update the handles to keep selected state
    if (handle) {
      handle.moving = false;
      handle.selected = true;
    }

    external.cornerstone.updateImage(element);
    element.addEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
  }

  const coords = eventData.startPoints.canvas;
  const toolData = getToolState(event.currentTarget, toolType);

  if (!toolData) {
    return;
  }

  // Now check to see if there is a handle we can move
  for (let i = 0; i < toolData.data.length; i++) {
    data = toolData.data[i];
    const handleParams = [element, data.handles, coords, distanceThreshold];
    const handle = getHandleNearImagePoint(...handleParams);

    if (handle) {
      // Hide the cursor to improve precision while resizing the line or set to move
      // If dragging text box

      // TODO: FIX THIS COMMMENT
      // $element.css('cursor', handle.hasBoundingBox ? 'move' : 'none');

      element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
      data.active = true;

      unselectAllHandles(data.handles);
      handle.moving = true;
      moveHandle(eventData, toolType, data, handle, () => handleDoneMove(handle));
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();

      return true;
    }
  }

  // Now check to see if there is a line we can move
  // Now check to see if we have a tool that we can move
  const opt = {
    deleteIfHandleOutsideImage: true,
    preventHandleOutsideImage: false
  };

  const getDoneMovingCallback = (handles) => () => {
    setHandlesMovingState(handles, false);
    handleDoneMove();
  };

  for (let i = 0; i < toolData.data.length; i++) {
    data = toolData.data[i];
    if (pointNearTool(element, data, coords)) {
      element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
      data.active = true;

      unselectAllHandles(data.handles);
      setHandlesMovingState(data.handles, true);

      const doneMovingCallback = getDoneMovingCallback(data.handles);
      const allHandlesParams = [event, data, toolData, toolType, opt, doneMovingCallback];

      moveAllHandles(...allHandlesParams);
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();

      return true;
    }
  }
}
