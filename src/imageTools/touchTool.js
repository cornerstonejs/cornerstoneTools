import * as cornerstone from 'cornerstone-core';
import anyHandlesOutsideImage from '../manipulators/anyHandlesOutsideImage.js';
import getHandleNearImagePoint from '../manipulators/getHandleNearImagePoint.js';
import touchMoveHandle from '../manipulators/touchMoveHandle.js';
import moveNewHandleTouch from '../manipulators/moveNewHandleTouch.js';
import touchMoveAllHandles from '../manipulators/touchMoveAllHandles.js';
import { addToolState, removeToolState, getToolState } from '../stateManagement/toolState.js';

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

function touchTool (touchToolInterface) {
    // /////// BEGIN ACTIVE TOOL ///////

  function addNewMeasurement (touchEventData) {
        // Console.log('touchTool addNewMeasurement');
    const element = touchEventData.element;

    const measurementData = touchToolInterface.createNewMeasurement(touchEventData);

    if (!measurementData) {
      return;
    }

    addToolState(element, touchToolInterface.toolType, measurementData);

    if (Object.keys(measurementData.handles).length === 1 && touchEventData.type === 'CornerstoneToolsTap') {
      measurementData.active = false;
      measurementData.handles.end.active = false;
      measurementData.handles.end.highlight = false;
      measurementData.invalidated = true;
      if (anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
                // Delete the measurement
        removeToolState(element, touchToolInterface.toolType, measurementData);
      }

      cornerstone.updateImage(element);

      return;
    }

    $(element).off('CornerstoneToolsTouchStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);
    $(element).off('CornerstoneToolsTap', touchToolInterface.tapCallback || tapCallback);
    $(element).off('CornerstoneToolsTouchStart', touchToolInterface.touchStartCallback || touchStartCallback);

    cornerstone.updateImage(element);
    moveNewHandleTouch(touchEventData, touchToolInterface.toolType, measurementData, measurementData.handles.end, function () {
      measurementData.active = false;
      measurementData.invalidated = true;
      if (anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
                // Delete the measurement
        removeToolState(element, touchToolInterface.toolType, measurementData);
      }

      $(element).on('CornerstoneToolsTouchStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);
      $(element).on('CornerstoneToolsTap', touchToolInterface.tapCallback || tapCallback);
      $(element).on('CornerstoneToolsTouchStart', touchToolInterface.touchStartCallback || touchStartCallback);
      cornerstone.updateImage(element);
    });
  }

  function touchDownActivateCallback (e, eventData) {
        // Console.log('touchTool touchDownActivateCallback');
    if (touchToolInterface.addNewMeasurement) {
      touchToolInterface.addNewMeasurement(eventData);
    } else {
      addNewMeasurement(eventData);
    }

    return false; // False = causes jquery to preventDefault() and stopPropagation() this event
  }
    // /////// END ACTIVE TOOL ///////

    // /////// BEGIN INACTIVE TOOL ///////
  function tapCallback (e, eventData) {
        // Console.log('touchTool tapCallback');
    const element = eventData.element;
    const coords = eventData.currentPoints.canvas;
    const toolData = getToolState(e.currentTarget, touchToolInterface.toolType);
    let data;
    let i;

        // Deactivate everything
    deactivateAllToolInstances(toolData);

    function doneMovingCallback () {
            // Console.log('touchTool tapCallback doneMovingCallback');
      deactivateAllToolInstances(toolData);
      if (anyHandlesOutsideImage(eventData, data.handles)) {
                // Delete the measurement
        removeToolState(element, touchToolInterface.toolType, data);
      }

      cornerstone.updateImage(element);
      $(element).on('CornerstoneToolsTouchStart', touchToolInterface.touchStartCallback || touchStartCallback);
      $(element).on('CornerstoneToolsTap', touchToolInterface.tapCallback || tapCallback);
    }

        // Now check to see if there is a handle we can move
    if (toolData) {
      for (i = 0; i < toolData.data.length; i++) {
        data = toolData.data[i];
        const distanceSq = 25; // Should probably make this a settable property later
        const handle = getHandleNearImagePoint(element, data.handles, coords, distanceSq);

        if (handle) {
          $(element).off('CornerstoneToolsTouchStart', touchToolInterface.touchStartCallback || touchStartCallback);
          $(element).off('CornerstoneToolsTap', touchToolInterface.tapCallback || tapCallback);
          data.active = true;
          handle.active = true;
          cornerstone.updateImage(element);
          touchMoveHandle(e, touchToolInterface.toolType, data, handle, doneMovingCallback);
          e.stopImmediatePropagation();

          return false; // False = causes jquery to preventDefault() and stopPropagation() this event
        }
      }
    }

        // Now check to see if we have a tool that we can move
    if (toolData && touchToolInterface.pointNearTool) {
      for (i = 0; i < toolData.data.length; i++) {
        data = toolData.data[i];
        if (touchToolInterface.pointNearTool(element, data, coords)) {
          $(element).off('CornerstoneToolsTouchStart', touchToolInterface.touchStartCallback || touchStartCallback);
          $(element).off('CornerstoneToolsTap', touchToolInterface.tapCallback || tapCallback);
          data.active = true;
          cornerstone.updateImage(element);
          touchMoveAllHandles(e, data, toolData, touchToolInterface.toolType, true, doneMovingCallback);
          e.stopImmediatePropagation();

          return false; // False = causes jquery to preventDefault() and stopPropagation() this event
        }
      }
    }

        // If there is nothing to move, add a new instance of the tool
        // Need to check here to see if activation is allowed!
    if (touchToolInterface.touchDownActivateCallback) {
      touchToolInterface.touchDownActivateCallback(e, eventData);
    } else {
      touchDownActivateCallback(e, eventData);
    }

    return false;
  }

  function touchStartCallback (e, eventData) {
        // Console.log('touchTool touchStartCallback');
    const element = eventData.element;
    const coords = eventData.startPoints.canvas;
    let data;
    const toolData = getToolState(e.currentTarget, touchToolInterface.toolType);
    let i;

    function doneMovingCallback (lastEvent, lastEventData) {
            // Console.log('touchTool touchStartCallback doneMovingCallback');
      data.active = false;
      data.invalidated = true;
      if (anyHandlesOutsideImage(eventData, data.handles)) {
                // Delete the measurement
        removeToolState(eventData.element, touchToolInterface.toolType, data);
      }

      cornerstone.updateImage(eventData.element);
      $(element).on('CornerstoneToolsTouchStart', touchToolInterface.touchStartCallback || touchStartCallback);
      $(element).on('CornerstoneToolsTap', touchToolInterface.tapCallback || tapCallback);

      if (touchToolInterface.pressCallback) {
        $(element).on('CornerstoneToolsTouchPress', touchToolInterface.pressCallback);
      }

      if (lastEvent && lastEvent.type === 'CornerstoneToolsTouchPress') {
        const event = $.Event(lastEvent.type, lastEventData);

        $(element).trigger(event, lastEventData);
      }
    }

        // Now check to see if there is a handle we can move

        // Average pixel width of index finger is 45-57 pixels
        // https://www.smashingmagazine.com/2012/02/finger-friendly-design-ideal-mobile-touchscreen-target-sizes/
    const distance = 28;

    if (!toolData) {
      return;
    }

    for (i = 0; i < toolData.data.length; i++) {
      data = toolData.data[i];

      const handle = getHandleNearImagePoint(eventData.element, data.handles, coords, distance);

      if (handle) {
        $(element).off('CornerstoneToolsTouchStart', touchToolInterface.touchStartCallback || touchStartCallback);
        $(element).off('CornerstoneToolsTap', touchToolInterface.tapCallback || tapCallback);
        if (touchToolInterface.pressCallback) {
          $(element).off('CornerstoneToolsTouchPress', touchToolInterface.pressCallback);
        }

        data.active = true;
        touchMoveHandle(e, touchToolInterface.toolType, data, handle, doneMovingCallback);
        e.stopImmediatePropagation();

        return false; // False = causes jquery to preventDefault() and stopPropagation() this event
      }
    }

        // Now check to see if we have a tool that we can move
    if (!touchToolInterface.pointNearTool) {
      return;
    }

    for (i = 0; i < toolData.data.length; i++) {
      data = toolData.data[i];

      if (touchToolInterface.pointNearTool(eventData.element, data, coords)) {
        $(element).off('CornerstoneToolsTouchStart', touchToolInterface.touchStartCallback || touchStartCallback);
        $(element).off('CornerstoneToolsTap', touchToolInterface.tapCallback || tapCallback);
        if (touchToolInterface.pressCallback) {
          $(element).off('CornerstoneToolsTouchPress', touchToolInterface.pressCallback);
        }

        touchMoveAllHandles(e, data, toolData, touchToolInterface.toolType, true, doneMovingCallback);
        e.stopImmediatePropagation();

        return false; // False = causes jquery to preventDefault() and stopPropagation() this event
      }
    }
  }
    // /////// END INACTIVE TOOL ///////

    // Not visible, not interactive
  function disable (element) {
    $(element).off('CornerstoneImageRendered', touchToolInterface.onImageRendered);
    $(element).off('CornerstoneToolsTouchStart', touchToolInterface.touchStartCallback || touchStartCallback);
    $(element).off('CornerstoneToolsTouchStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);
    $(element).off('CornerstoneToolsTap', touchToolInterface.tapCallback || tapCallback);

    if (touchToolInterface.doubleTapCallback) {
      $(element).off('CornerstoneToolsDoubleTap', touchToolInterface.doubleTapCallback);
    }

    if (touchToolInterface.pressCallback) {
      $(element).off('CornerstoneToolsTouchPress', touchToolInterface.pressCallback);
    }

    cornerstone.updateImage(element);
  }

    // Visible but not interactive
  function enable (element) {
    $(element).off('CornerstoneImageRendered', touchToolInterface.onImageRendered);
    $(element).off('CornerstoneToolsTouchStart', touchToolInterface.touchStartCallback || touchStartCallback);
    $(element).off('CornerstoneToolsTouchStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);
    $(element).off('CornerstoneToolsTap', touchToolInterface.tapCallback || tapCallback);

    $(element).on('CornerstoneImageRendered', touchToolInterface.onImageRendered);

    if (touchToolInterface.doubleTapCallback) {
      $(element).off('CornerstoneToolsDoubleTap', touchToolInterface.doubleTapCallback);
    }

    if (touchToolInterface.pressCallback) {
      $(element).off('CornerstoneToolsTouchPress', touchToolInterface.pressCallback);
    }

    cornerstone.updateImage(element);
  }

    // Visible, interactive and can create
  function activate (element) {
        // Console.log('activate touchTool');

    $(element).off('CornerstoneImageRendered', touchToolInterface.onImageRendered);
    $(element).off('CornerstoneToolsTouchStart', touchToolInterface.touchStartCallback || touchStartCallback);
    $(element).off('CornerstoneToolsTouchStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);
    $(element).off('CornerstoneToolsTap', touchToolInterface.tapCallback || tapCallback);

    $(element).on('CornerstoneImageRendered', touchToolInterface.onImageRendered);
    $(element).on('CornerstoneToolsTouchStart', touchToolInterface.touchStartCallback || touchStartCallback);
    $(element).on('CornerstoneToolsTouchStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);
    $(element).on('CornerstoneToolsTap', touchToolInterface.tapCallback || tapCallback);

    if (touchToolInterface.doubleTapCallback) {
      $(element).off('CornerstoneToolsDoubleTap', touchToolInterface.doubleTapCallback);
      $(element).on('CornerstoneToolsDoubleTap', touchToolInterface.doubleTapCallback);
    }

    if (touchToolInterface.pressCallback) {
      $(element).off('CornerstoneToolsTouchPress', touchToolInterface.pressCallback);
      $(element).on('CornerstoneToolsTouchPress', touchToolInterface.pressCallback);
    }

    cornerstone.updateImage(element);
  }

    // Visible, interactive
  function deactivate (element) {
    const eventType = 'CornerstoneToolsToolDeactivated';
    const statusChangeEventData = {
      toolType: touchToolInterface.toolType,
      type: eventType
    };

    const event = $.Event(eventType, statusChangeEventData);

    $(element).trigger(event, statusChangeEventData);

    $(element).off('CornerstoneImageRendered', touchToolInterface.onImageRendered);
    $(element).off('CornerstoneToolsTouchStart', touchToolInterface.touchStartCallback || touchStartCallback);
    $(element).off('CornerstoneToolsTouchStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);
    $(element).off('CornerstoneToolsTap', touchToolInterface.tapCallback || tapCallback);

    $(element).on('CornerstoneImageRendered', touchToolInterface.onImageRendered);
    $(element).on('CornerstoneToolsTouchStart', touchToolInterface.touchStartCallback || touchStartCallback);
        // $(element).on('CornerstoneToolsTap', touchToolInterface.tapCallback || tapCallback);

    if (touchToolInterface.doubleTapCallback) {
      $(element).off('CornerstoneToolsDoubleTap', touchToolInterface.doubleTapCallback);
    }

    if (touchToolInterface.pressCallback) {
      $(element).off('CornerstoneToolsTouchPress', touchToolInterface.pressCallback);
    }

    cornerstone.updateImage(element);
  }

  const toolInterface = {
    enable,
    disable,
    activate,
    deactivate,
    touchStartCallback: touchToolInterface.touchStartCallback || touchStartCallback,
    touchDownActivateCallback: touchToolInterface.touchDownActivateCallback || touchDownActivateCallback,
    tapCallback: touchToolInterface.tapCallback || tapCallback
  };

    // Expose pointNearTool if available
  if (touchToolInterface.pointNearTool) {
    toolInterface.pointNearTool = touchToolInterface.pointNearTool;
  }

  if (touchToolInterface.doubleTapCallback) {
    toolInterface.doubleTapCallback = touchToolInterface.doubleTapCallback;
  }

  if (touchToolInterface.pressCallback) {
    toolInterface.pressCallback = touchToolInterface.pressCallback;
  }

  if (touchToolInterface.addNewMeasurement) {
    toolInterface.addNewMeasurement = touchToolInterface.addNewMeasurement;
  }

  return toolInterface;
}

export default touchTool;
