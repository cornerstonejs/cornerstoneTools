import * as cornerstone from 'cornerstone-core';
import toolCoordinates from '../stateManagement/toolCoordinates.js';
import getHandleNearImagePoint from '../manipulators/getHandleNearImagePoint.js';
import handleActivator from '../manipulators/handleActivator';
import moveHandle from '../manipulators/moveHandle';
import moveAllHandles from '../manipulators/moveAllHandles';
import anyHandlesOutsideImage from '../manipulators/anyHandlesOutsideImage.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { addToolState, removeToolState, getToolState } from '../stateManagement/toolState.js';

export default function (mouseToolInterface, preventHandleOutsideImage) {
    // /////// BEGIN ACTIVE TOOL ///////
  function addNewMeasurement (mouseEventData) {
    const measurementData = mouseToolInterface.createNewMeasurement(mouseEventData);

        // Prevent adding new measurement if tool returns nill
    if (!measurementData) {
      return;
    }

        // Associate this data with this imageId so we can render it and manipulate it
    addToolState(mouseEventData.element, mouseToolInterface.toolType, measurementData);

        // Since we are dragging to another place to drop the end point, we can just activate
        // The end point and let the moveHandle move it for us.
    $(mouseEventData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
    moveHandle(mouseEventData, mouseToolInterface.toolType, measurementData, measurementData.handles.end, function () {
      measurementData.active = false;
      if (anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
                // Delete the measurement
        removeToolState(mouseEventData.element, mouseToolInterface.toolType, measurementData);
      }

      $(mouseEventData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
    }, preventHandleOutsideImage);
  }

  function mouseDownActivateCallback (e, eventData) {
    if (isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
      addNewMeasurement(eventData);

      return false; // False = cases jquery to preventDefault() and stopPropagation() this event
    }
  }
    // /////// END ACTIVE TOOL ///////

    // /////// BEGIN DEACTIVE TOOL ///////

  function mouseMoveCallback (e, eventData) {
    toolCoordinates.setCoords(eventData);
        // If a mouse button is down, do nothing
    if (eventData.which !== 0) {
      return;
    }

        // If we have no tool data for this element, do nothing
    const toolData = getToolState(eventData.element, mouseToolInterface.toolType);

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
      cornerstone.updateImage(eventData.element);
    }
  }

  function mouseDownCallback (e, eventData) {
    let data;

    function handleDoneMove () {
      data.active = false;
      if (anyHandlesOutsideImage(eventData, data.handles)) {
                // Delete the measurement
        removeToolState(eventData.element, mouseToolInterface.toolType, data);
      }

      cornerstone.updateImage(eventData.element);
      $(eventData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
    }

    if (isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
      const coords = eventData.startPoints.canvas;
      const toolData = getToolState(e.currentTarget, mouseToolInterface.toolType);

      let i;

            // Now check to see if there is a handle we can move
      const distanceSq = 25;

      if (toolData !== undefined) {
        for (i = 0; i < toolData.data.length; i++) {
          data = toolData.data[i];
          const handle = getHandleNearImagePoint(eventData.element, data.handles, coords, distanceSq);

          if (handle !== undefined) {
            $(eventData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
            data.active = true;
            moveHandle(eventData, mouseToolInterface.toolType, data, handle, handleDoneMove, preventHandleOutsideImage);
            e.stopImmediatePropagation();

            return false;
          }
        }
      }

            // Now check to see if there is a line we can move
            // Now check to see if we have a tool that we can move
      const options = {
        deleteIfHandleOutsideImage: true,
        preventHandleOutsideImage
      };

      if (toolData !== undefined && mouseToolInterface.pointInsideRect !== undefined) {
        for (i = 0; i < toolData.data.length; i++) {
          data = toolData.data[i];
          if (mouseToolInterface.pointInsideRect(eventData.element, data, coords)) {
            $(eventData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
            moveAllHandles(e, data, toolData, mouseToolInterface.toolType, options, handleDoneMove);
            $(eventData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
            e.stopImmediatePropagation();

            return false;
          }
        }
      }
    }
  }
    // /////// END DEACTIVE TOOL ///////

    // Not visible, not interactive
  function disable (element) {
    $(element).off('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
    $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
    $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
    $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);

    cornerstone.updateImage(element);
  }

    // Visible but not interactive
  function enable (element) {
    $(element).off('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
    $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
    $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
    $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);

    $(element).on('CornerstoneImageRendered', mouseToolInterface.onImageRendered);

    cornerstone.updateImage(element);
  }

    // Visible, interactive and can create
  function activate (element, mouseButtonMask) {
    const eventData = {
      mouseButtonMask
    };

    $(element).off('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
    $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
    $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
    $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);

    $(element).on('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
    $(element).on('CornerstoneToolsMouseMove', eventData, mouseMoveCallback);
    $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);
    $(element).on('CornerstoneToolsMouseDownActivate', eventData, mouseDownActivateCallback);

    cornerstone.updateImage(element);
  }

    // Visible, interactive
  function deactivate (element, mouseButtonMask) {
    const eventData = {
      mouseButtonMask
    };

    $(element).off('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
    $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
    $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
    $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);

    $(element).on('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
    $(element).on('CornerstoneToolsMouseMove', eventData, mouseMoveCallback);
    $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);

    cornerstone.updateImage(element);
  }

  const toolInterface = {
    enable,
    disable,
    activate,
    deactivate
  };

  return toolInterface;
}
