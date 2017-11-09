import { external } from '../externalModules.js';
import toolCoordinates from '../stateManagement/toolCoordinates.js';
import getHandleNearImagePoint from '../manipulators/getHandleNearImagePoint.js';
import handleActivator from '../manipulators/handleActivator.js';
import moveHandle from '../manipulators/moveHandle.js';
import moveNewHandle from '../manipulators/moveNewHandle.js';
import moveAllHandles from '../manipulators/moveAllHandles.js';
import anyHandlesOutsideImage from '../manipulators/anyHandlesOutsideImage.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { addToolState, removeToolState, getToolState } from '../stateManagement/toolState.js';

export default function (mouseToolInterface) {
  let configuration = {};

  // /////// BEGIN ACTIVE TOOL ///////
  function addNewMeasurement (mouseEventData) {
    const cornerstone = external.cornerstone;
    const element = mouseEventData.element;

    const measurementData = mouseToolInterface.createNewMeasurement(mouseEventData);

    if (!measurementData) {
      return;
    }

    const eventData = {
      mouseButtonMask: mouseEventData.which
    };

    // Associate this data with this imageId so we can render it and manipulate it
    addToolState(mouseEventData.element, mouseToolInterface.toolType, measurementData);

    // Since we are dragging to another place to drop the end point, we can just activate
    // The end point and let the moveHandle move it for us.
    external.$(element).off('CornerstoneToolsMouseMove', mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
    external.$(element).off('CornerstoneToolsMouseDown', mouseToolInterface.mouseDownCallback || mouseDownCallback);
    external.$(element).off('CornerstoneToolsMouseDownActivate', mouseToolInterface.mouseDownActivateCallback || mouseDownActivateCallback);

    if (mouseToolInterface.mouseDoubleClickCallback) {
      external.$(element).off('CornerstoneToolsMouseDoubleClick', mouseToolInterface.mouseDoubleClickCallback);
    }

    cornerstone.updateImage(element);

    let handleMover;

    if (Object.keys(measurementData.handles).length === 1) {
      handleMover = moveHandle;
    } else {
      handleMover = moveNewHandle;
    }

    let preventHandleOutsideImage;

    if (mouseToolInterface.options && mouseToolInterface.options.preventHandleOutsideImage !== undefined) {
      preventHandleOutsideImage = mouseToolInterface.options.preventHandleOutsideImage;
    } else {
      preventHandleOutsideImage = false;
    }

    handleMover(mouseEventData, mouseToolInterface.toolType, measurementData, measurementData.handles.end, function () {
      measurementData.active = false;
      measurementData.invalidated = true;
      if (anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
        // Delete the measurement
        removeToolState(element, mouseToolInterface.toolType, measurementData);
      }

      external.$(element).on('CornerstoneToolsMouseMove', eventData, mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
      external.$(element).on('CornerstoneToolsMouseDown', eventData, mouseToolInterface.mouseDownCallback || mouseDownCallback);
      external.$(element).on('CornerstoneToolsMouseDownActivate', eventData, mouseToolInterface.mouseDownActivateCallback || mouseDownActivateCallback);

      if (mouseToolInterface.mouseDoubleClickCallback) {
        external.$(element).on('CornerstoneToolsMouseDoubleClick', eventData, mouseToolInterface.mouseDoubleClickCallback);
      }

      cornerstone.updateImage(element);
    }, preventHandleOutsideImage);
  }

  function mouseDownActivateCallback (e, eventData) {
    if (isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
      if (mouseToolInterface.addNewMeasurement) {
        mouseToolInterface.addNewMeasurement(eventData);
      } else {
        addNewMeasurement(eventData);
      }

      return false; // False = causes jquery to preventDefault() and stopPropagation() this event
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

    if (!toolData) {
      return;
    }

    // We have tool data, search through all data
    // And see if we can activate a handle
    let imageNeedsUpdate = false;

    for (let i = 0; i < toolData.data.length; i++) {
      // Get the cursor position in canvas coordinates
      const coords = eventData.currentPoints.canvas;

      const data = toolData.data[i];

      if (handleActivator(eventData.element, data.handles, coords) === true) {
        imageNeedsUpdate = true;
      }

      if ((mouseToolInterface.pointNearTool(eventData.element, data, coords) && !data.active) || (!mouseToolInterface.pointNearTool(eventData.element, data, coords) && data.active)) {
        data.active = !data.active;
        imageNeedsUpdate = true;
      }
    }

    // Handle activation status changed, redraw the image
    if (imageNeedsUpdate === true) {
      external.cornerstone.updateImage(eventData.element);
    }
  }

  function mouseDownCallback (e, eventData) {
    let data;
    const element = eventData.element;

    function handleDoneMove () {
      data.invalidated = true;
      if (anyHandlesOutsideImage(eventData, data.handles)) {
        // Delete the measurement
        removeToolState(element, mouseToolInterface.toolType, data);
      }

      external.cornerstone.updateImage(element);
      external.$(element).on('CornerstoneToolsMouseMove', eventData, mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
    }

    if (!isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
      return;
    }

    const coords = eventData.startPoints.canvas;
    const toolData = getToolState(e.currentTarget, mouseToolInterface.toolType);

    if (!toolData) {
      return;
    }

    let i;

    // Now check to see if there is a handle we can move

    let preventHandleOutsideImage;

    if (mouseToolInterface.options && mouseToolInterface.options.preventHandleOutsideImage !== undefined) {
      preventHandleOutsideImage = mouseToolInterface.options.preventHandleOutsideImage;
    } else {
      preventHandleOutsideImage = false;
    }

    for (i = 0; i < toolData.data.length; i++) {
      data = toolData.data[i];
      const distance = 6;
      const handle = getHandleNearImagePoint(element, data.handles, coords, distance);

      if (handle) {
        external.$(element).off('CornerstoneToolsMouseMove', mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
        data.active = true;
        moveHandle(eventData, mouseToolInterface.toolType, data, handle, handleDoneMove, preventHandleOutsideImage);
        e.stopImmediatePropagation();

        return false;
      }
    }

    // Now check to see if there is a line we can move
    // Now check to see if we have a tool that we can move
    if (!mouseToolInterface.pointNearTool) {
      return;
    }

    const options = mouseToolInterface.options || {
      deleteIfHandleOutsideImage: true,
      preventHandleOutsideImage: false
    };

    for (i = 0; i < toolData.data.length; i++) {
      data = toolData.data[i];
      data.active = false;
      if (mouseToolInterface.pointNearTool(element, data, coords)) {
        data.active = true;
        external.$(element).off('CornerstoneToolsMouseMove', mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
        moveAllHandles(e, data, toolData, mouseToolInterface.toolType, options, handleDoneMove);
        e.stopImmediatePropagation();

        return false;
      }
    }
  }
  // /////// END DEACTIVE TOOL ///////

  // Not visible, not interactive
  function disable (element) {
    external.$(element).off('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
    external.$(element).off('CornerstoneToolsMouseMove', mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
    external.$(element).off('CornerstoneToolsMouseDown', mouseToolInterface.mouseDownCallback || mouseDownCallback);
    external.$(element).off('CornerstoneToolsMouseDownActivate', mouseToolInterface.mouseDownActivateCallback || mouseDownActivateCallback);

    if (mouseToolInterface.mouseDoubleClickCallback) {
      external.$(element).off('CornerstoneToolsMouseDoubleClick', mouseToolInterface.mouseDoubleClickCallback);
    }

    external.cornerstone.updateImage(element);
  }

  // Visible but not interactive
  function enable (element) {
    external.$(element).off('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
    external.$(element).off('CornerstoneToolsMouseMove', mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
    external.$(element).off('CornerstoneToolsMouseDown', mouseToolInterface.mouseDownCallback || mouseDownCallback);
    external.$(element).off('CornerstoneToolsMouseDownActivate', mouseToolInterface.mouseDownActivateCallback || mouseDownActivateCallback);

    if (mouseToolInterface.mouseDoubleClickCallback) {
      external.$(element).off('CornerstoneToolsMouseDoubleClick', mouseToolInterface.mouseDoubleClickCallback);
    }

    external.$(element).on('CornerstoneImageRendered', mouseToolInterface.onImageRendered);

    external.cornerstone.updateImage(element);
  }

  // Visible, interactive and can create
  function activate (element, mouseButtonMask) {
    const eventData = {
      mouseButtonMask
    };

    external.$(element).off('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
    external.$(element).off('CornerstoneToolsMouseMove', mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
    external.$(element).off('CornerstoneToolsMouseDown', mouseToolInterface.mouseDownCallback || mouseDownCallback);
    external.$(element).off('CornerstoneToolsMouseDownActivate', mouseToolInterface.mouseDownActivateCallback || mouseDownActivateCallback);

    external.$(element).on('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
    external.$(element).on('CornerstoneToolsMouseMove', eventData, mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
    external.$(element).on('CornerstoneToolsMouseDown', eventData, mouseToolInterface.mouseDownCallback || mouseDownCallback);
    external.$(element).on('CornerstoneToolsMouseDownActivate', eventData, mouseToolInterface.mouseDownActivateCallback || mouseDownActivateCallback);

    if (mouseToolInterface.mouseDoubleClickCallback) {
      external.$(element).off('CornerstoneToolsMouseDoubleClick', mouseToolInterface.mouseDoubleClickCallback);
      external.$(element).on('CornerstoneToolsMouseDoubleClick', eventData, mouseToolInterface.mouseDoubleClickCallback);
    }

    external.cornerstone.updateImage(element);
  }

  // Visible, interactive
  function deactivate (element, mouseButtonMask) {
    const eventData = {
      mouseButtonMask
    };

    const eventType = 'CornerstoneToolsToolDeactivated';
    const statusChangeEventData = {
      mouseButtonMask,
      toolType: mouseToolInterface.toolType,
      type: eventType
    };

    const event = external.$.Event(eventType, statusChangeEventData);

    external.$(element).trigger(event, statusChangeEventData);

    external.$(element).off('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
    external.$(element).off('CornerstoneToolsMouseMove', mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
    external.$(element).off('CornerstoneToolsMouseDown', mouseToolInterface.mouseDownCallback || mouseDownCallback);
    external.$(element).off('CornerstoneToolsMouseDownActivate', mouseToolInterface.mouseDownActivateCallback || mouseDownActivateCallback);

    external.$(element).on('CornerstoneImageRendered', mouseToolInterface.onImageRendered);
    external.$(element).on('CornerstoneToolsMouseMove', eventData, mouseToolInterface.mouseMoveCallback || mouseMoveCallback);
    external.$(element).on('CornerstoneToolsMouseDown', eventData, mouseToolInterface.mouseDownCallback || mouseDownCallback);

    if (mouseToolInterface.mouseDoubleClickCallback) {
      external.$(element).off('CornerstoneToolsMouseDoubleClick', mouseToolInterface.mouseDoubleClickCallback);
      external.$(element).on('CornerstoneToolsMouseDoubleClick', eventData, mouseToolInterface.mouseDoubleClickCallback);
    }

    if (mouseToolInterface.deactivate) {
      mouseToolInterface.deactivate(element, mouseButtonMask);
    }

    external.cornerstone.updateImage(element);
  }

  function getConfiguration () {
    return configuration;
  }

  function setConfiguration (config) {
    configuration = config;
  }

  const toolInterface = {
    enable,
    disable,
    activate,
    deactivate,
    getConfiguration,
    setConfiguration,
    mouseDownCallback,
    mouseMoveCallback,
    mouseDownActivateCallback
  };

    // Expose pointNearTool if available
  if (mouseToolInterface.pointNearTool) {
    toolInterface.pointNearTool = mouseToolInterface.pointNearTool;
  }

  if (mouseToolInterface.mouseDoubleClickCallback) {
    toolInterface.mouseDoubleClickCallback = mouseToolInterface.mouseDoubleClickCallback;
  }

  if (mouseToolInterface.addNewMeasurement) {
    toolInterface.addNewMeasurement = mouseToolInterface.addNewMeasurement;
  }

  return toolInterface;
}
