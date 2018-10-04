import EVENTS from '../events.js';
import external from '../externalModules.js';
import toolCoordinates from '../stateManagement/toolCoordinates.js';
import getHandleNearImagePoint from '../manipulators/getHandleNearImagePoint.js';
import handleActivator from '../manipulators/handleActivator.js';
import moveHandle from '../manipulators/moveHandle.js';
import moveAllHandles from '../manipulators/moveAllHandles.js';
import anyHandlesOutsideImage from '../manipulators/anyHandlesOutsideImage.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { addToolState, removeToolState, getToolState } from '../stateManagement/toolState.js';
import { setToolOptions, getToolOptions } from '../toolOptions.js';

export default function (mouseToolInterface, preventHandleOutsideImage) {
  const toolType = mouseToolInterface.toolType;

  // /////// BEGIN ACTIVE TOOL ///////
  function addNewMeasurement (mouseEventData) {
    const element = mouseEventData.element;
    const measurementData = mouseToolInterface.createNewMeasurement(mouseEventData);

    // Prevent adding new measurement if tool returns nill
    if (!measurementData) {
      return;
    }

    // Associate this data with this imageId so we can render it and manipulate it
    addToolState(mouseEventData.element, toolType, measurementData);

    // Since we are dragging to another place to drop the end point, we can just activate
    // The end point and let the moveHandle move it for us.
    element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
    moveHandle(mouseEventData, toolType, measurementData, measurementData.handles.end, function () {
      measurementData.active = false;
      if (anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
        // Delete the measurement
        removeToolState(mouseEventData.element, toolType, measurementData);
      }

      element.addEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
    }, preventHandleOutsideImage);
  }

  function mouseDownActivateCallback (e) {
    const eventData = e.detail;
    const element = eventData.element;
    const options = getToolOptions(toolType, element);

    if (isMouseButtonEnabled(eventData.which, options.mouseButtonMask)) {
      addNewMeasurement(eventData);

      return false;
    }
  }
  // /////// END ACTIVE TOOL ///////

  // /////// BEGIN DEACTIVE TOOL ///////

  function mouseMoveCallback (e) {
    const eventData = e.detail;

    toolCoordinates.setCoords(eventData);

    // If we have no tool data for this element, do nothing
    const toolData = getToolState(eventData.element, toolType);

    if (toolData === undefined) {
      return;
    }

    // We have tool data, search through all data
    // And see if we can activate a handle
    let imageNeedsUpdate = false;
    const coords = eventData.currentPoints.canvas;

    for (let i = 0; i < toolData.data.length; i++) {
      // Get the cursor position in image coordinates
      const data = toolData.data[i];

      if (handleActivator(eventData.element, data.handles, coords) === true) {
        imageNeedsUpdate = true;
      }

      if ((mouseToolInterface.pointInsideRect(eventData.element, data, coords) && !data.active) || (!mouseToolInterface.pointInsideRect(eventData.element, data, coords) && data.active)) {
        data.active = !data.active;
        imageNeedsUpdate = true;
      }
    }

    // Handle activation status changed, redraw the image
    if (imageNeedsUpdate === true) {
      external.cornerstone.updateImage(eventData.element);
    }
  }

  function mouseDownCallback (e) {
    const eventData = e.detail;
    const element = eventData.element;
    const cornerstone = external.cornerstone;
    let data;
    const options = getToolOptions(toolType, element);

    if (!isMouseButtonEnabled(eventData.which, options.mouseButtonMask)) {
      return;
    }

    function handleDoneMove () {
      data.active = false;
      if (anyHandlesOutsideImage(eventData, data.handles)) {
        // Delete the measurement
        removeToolState(eventData.element, toolType, data);
      }

      cornerstone.updateImage(eventData.element);
      element.addEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
    }

    const coords = eventData.startPoints.canvas;
    const toolData = getToolState(e.currentTarget, toolType);

    let i;

    // Now check to see if there is a handle we can move
    const distanceSq = 25;

    if (toolData !== undefined) {
      for (i = 0; i < toolData.data.length; i++) {
        data = toolData.data[i];
        const handle = getHandleNearImagePoint(eventData.element, data.handles, coords, distanceSq);

        if (handle !== undefined) {
          element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
          data.active = true;
          moveHandle(eventData, toolType, data, handle, handleDoneMove, preventHandleOutsideImage);
          e.stopImmediatePropagation();

          return false;
        }
      }
    }

    // Now check to see if there is a line we can move
    // Now check to see if we have a tool that we can move
    const opt = {
      deleteIfHandleOutsideImage: true,
      preventHandleOutsideImage
    };

    if (toolData !== undefined && mouseToolInterface.pointInsideRect !== undefined) {
      for (i = 0; i < toolData.data.length; i++) {
        data = toolData.data[i];
        if (mouseToolInterface.pointInsideRect(eventData.element, data, coords)) {
          element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
          moveAllHandles(e, data, toolData, toolType, opt, handleDoneMove);
          element.addEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
          e.stopImmediatePropagation();

          return false;
        }
      }
    }
  }
  // /////// END DEACTIVE TOOL ///////

  // Not visible, not interactive
  function disable (element) {
    element.removeEventListener(external.cornerstone.EVENTS.IMAGE_RENDERED, mouseToolInterface.onImageRendered);
    element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
    element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);
    element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivateCallback);

    external.cornerstone.updateImage(element);
  }

  // Visible but not interactive
  function enable (element) {
    element.removeEventListener(external.cornerstone.EVENTS.IMAGE_RENDERED, mouseToolInterface.onImageRendered);
    element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
    element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);
    element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivateCallback);

    element.addEventListener(external.cornerstone.EVENTS.IMAGE_RENDERED, mouseToolInterface.onImageRendered);

    external.cornerstone.updateImage(element);
  }

  // Visible, interactive and can create
  function activate (element, mouseButtonMask) {
    setToolOptions(toolType, element, { mouseButtonMask });

    element.removeEventListener(external.cornerstone.EVENTS.IMAGE_RENDERED, mouseToolInterface.onImageRendered);
    element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
    element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);
    element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivateCallback);

    element.addEventListener(external.cornerstone.EVENTS.IMAGE_RENDERED, mouseToolInterface.onImageRendered);
    element.addEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
    element.addEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);
    element.addEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivateCallback);

    external.cornerstone.updateImage(element);
  }

  // Visible, interactive
  function deactivate (element, mouseButtonMask) {
    setToolOptions(toolType, element, { mouseButtonMask });

    element.removeEventListener(external.cornerstone.EVENTS.IMAGE_RENDERED, mouseToolInterface.onImageRendered);
    element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
    element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);
    element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivateCallback);

    element.addEventListener(external.cornerstone.EVENTS.IMAGE_RENDERED, mouseToolInterface.onImageRendered);
    element.addEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
    element.addEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);

    external.cornerstone.updateImage(element);
  }

  const toolInterface = {
    enable,
    disable,
    activate,
    deactivate
  };

  return toolInterface;
}
