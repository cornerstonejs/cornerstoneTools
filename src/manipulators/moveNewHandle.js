import * as cornerstone from 'cornerstone-core';

export default function (mouseEventData, toolType, data, handle, doneMovingCallback, preventHandleOutsideImage) {
  const element = mouseEventData.element;

  function moveCallback (e, eventData) {
    handle.active = true;
    handle.x = eventData.currentPoints.image.x;
    handle.y = eventData.currentPoints.image.y;

    if (preventHandleOutsideImage) {
      handle.x = Math.max(handle.x, 0);
      handle.x = Math.min(handle.x, eventData.image.width);

      handle.y = Math.max(handle.y, 0);
      handle.y = Math.min(handle.y, eventData.image.height);
    }

    cornerstone.updateImage(element);

    const eventType = 'CornerstoneToolsMeasurementModified';
    const modifiedEventData = {
      toolType,
      element,
      measurementData: data
    };

    $(element).trigger(eventType, modifiedEventData);
  }

  function whichMovement (e) {
    $(element).off('CornerstoneToolsMouseMove', whichMovement);
    $(element).off('CornerstoneToolsMouseDrag', whichMovement);

    $(element).on('CornerstoneToolsMouseMove', moveCallback);
    $(element).on('CornerstoneToolsMouseDrag', moveCallback);

    $(element).on('CornerstoneToolsMouseClick', moveEndCallback);
    if (e.type === 'CornerstoneToolsMouseDrag') {
      $(element).on('CornerstoneToolsMouseUp', moveEndCallback);
    }
  }

  function measurementRemovedCallback (e, eventData) {
    if (eventData.measurementData === data) {
      moveEndCallback();
    }
  }

  function toolDeactivatedCallback (e, eventData) {
    if (eventData.toolType === toolType) {
      $(element).off('CornerstoneToolsMouseMove', moveCallback);
      $(element).off('CornerstoneToolsMouseDrag', moveCallback);
      $(element).off('CornerstoneToolsMouseClick', moveEndCallback);
      $(element).off('CornerstoneToolsMouseUp', moveEndCallback);
      $(element).off('CornerstoneToolsMeasurementRemoved', measurementRemovedCallback);
      $(element).off('CornerstoneToolsToolDeactivated', toolDeactivatedCallback);

      handle.active = false;
      cornerstone.updateImage(element);
    }
  }

  $(element).on('CornerstoneToolsMouseDrag', whichMovement);
  $(element).on('CornerstoneToolsMouseMove', whichMovement);
  $(element).on('CornerstoneToolsMeasurementRemoved', measurementRemovedCallback);
  $(element).on('CornerstoneToolsToolDeactivated', toolDeactivatedCallback);

  function moveEndCallback () {
    $(element).off('CornerstoneToolsMouseMove', moveCallback);
    $(element).off('CornerstoneToolsMouseDrag', moveCallback);
    $(element).off('CornerstoneToolsMouseClick', moveEndCallback);
    $(element).off('CornerstoneToolsMouseUp', moveEndCallback);
    $(element).off('CornerstoneToolsMeasurementRemoved', measurementRemovedCallback);
    $(element).off('CornerstoneToolsToolDeactivated', toolDeactivatedCallback);

    handle.active = false;
    cornerstone.updateImage(element);

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback();
    }
  }
}
