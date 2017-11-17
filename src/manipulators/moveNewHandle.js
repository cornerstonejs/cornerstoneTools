import { external } from '../externalModules.js';
import triggerEvent from '../util/triggerEvent.js';

export default function (mouseEventData, toolType, data, handle, doneMovingCallback, preventHandleOutsideImage) {
  const cornerstone = external.cornerstone;
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

    triggerEvent(element, eventType, modifiedEventData);
  }

  function whichMovement (e) {
    external.$(element).off('CornerstoneToolsMouseMove', whichMovement);
    external.$(element).off('CornerstoneToolsMouseDrag', whichMovement);

    external.$(element).on('CornerstoneToolsMouseMove', moveCallback);
    external.$(element).on('CornerstoneToolsMouseDrag', moveCallback);

    external.$(element).on('CornerstoneToolsMouseClick', moveEndCallback);
    if (e.type === 'CornerstoneToolsMouseDrag') {
      external.$(element).on('CornerstoneToolsMouseUp', moveEndCallback);
    }
  }

  function measurementRemovedCallback (e, eventData) {
    if (eventData.measurementData === data) {
      moveEndCallback();
    }
  }

  function toolDeactivatedCallback (e, eventData) {
    if (eventData.toolType === toolType) {
      external.$(element).off('CornerstoneToolsMouseMove', moveCallback);
      external.$(element).off('CornerstoneToolsMouseDrag', moveCallback);
      external.$(element).off('CornerstoneToolsMouseClick', moveEndCallback);
      external.$(element).off('CornerstoneToolsMouseUp', moveEndCallback);
      external.$(element).off('CornerstoneToolsMeasurementRemoved', measurementRemovedCallback);
      external.$(element).off('CornerstoneToolsToolDeactivated', toolDeactivatedCallback);

      handle.active = false;
      cornerstone.updateImage(element);
    }
  }

  external.$(element).on('CornerstoneToolsMouseDrag', whichMovement);
  external.$(element).on('CornerstoneToolsMouseMove', whichMovement);
  external.$(element).on('CornerstoneToolsMeasurementRemoved', measurementRemovedCallback);
  external.$(element).on('CornerstoneToolsToolDeactivated', toolDeactivatedCallback);

  function moveEndCallback () {
    external.$(element).off('CornerstoneToolsMouseMove', moveCallback);
    external.$(element).off('CornerstoneToolsMouseDrag', moveCallback);
    external.$(element).off('CornerstoneToolsMouseClick', moveEndCallback);
    external.$(element).off('CornerstoneToolsMouseUp', moveEndCallback);
    external.$(element).off('CornerstoneToolsMeasurementRemoved', measurementRemovedCallback);
    external.$(element).off('CornerstoneToolsToolDeactivated', toolDeactivatedCallback);

    handle.active = false;
    cornerstone.updateImage(element);

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback();
    }
  }
}
