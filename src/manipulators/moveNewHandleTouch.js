import { external } from '../externalModules.js';
import triggerEvent from '../util/triggerEvent.js';

export default function (eventData, toolType, data, handle, doneMovingCallback, preventHandleOutsideImage) {
  // Console.log('moveNewHandleTouch');
  const cornerstone = external.cornerstone;
  const element = eventData.element;
  const imageCoords = cornerstone.pageToPixel(element, eventData.currentPoints.page.x, eventData.currentPoints.page.y + 50);
  const distanceFromTouch = {
    x: handle.x - imageCoords.x,
    y: handle.y - imageCoords.y
  };

  handle.active = true;
  data.active = true;

  function moveCallback (e, eventData) {
    handle.x = eventData.currentPoints.image.x + distanceFromTouch.x;
    handle.y = eventData.currentPoints.image.y + distanceFromTouch.y;

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

  function moveEndCallback (e, eventData) {
    external.$(element).off('CornerstoneToolsTouchDrag', moveCallback);
    external.$(element).off('CornerstoneToolsTouchPinch', moveEndCallback);
    external.$(element).off('CornerstoneToolsTouchEnd', moveEndCallback);
    external.$(element).off('CornerstoneToolsTap', moveEndCallback);
    external.$(element).off('CornerstoneToolsTouchStart', stopImmediatePropagation);
    external.$(element).off('CornerstoneToolsToolDeactivated', toolDeactivatedCallback);

    if (e.type === 'CornerstoneToolsTouchPinch' || e.type === 'CornerstoneToolsTouchPress') {
      handle.active = false;
      cornerstone.updateImage(element);
      doneMovingCallback();

      return;
    }

    handle.active = false;
    data.active = false;
    handle.x = eventData.currentPoints.image.x + distanceFromTouch.x;
    handle.y = eventData.currentPoints.image.y + distanceFromTouch.y;

    if (preventHandleOutsideImage) {
      handle.x = Math.max(handle.x, 0);
      handle.x = Math.min(handle.x, eventData.image.width);

      handle.y = Math.max(handle.y, 0);
      handle.y = Math.min(handle.y, eventData.image.height);
    }

    cornerstone.updateImage(element);

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback();
    }
  }

  function stopImmediatePropagation (e) {
    // Stop the CornerstoneToolsTouchStart event from
    // Become a CornerstoneToolsTouchStartActive event when
    // MoveNewHandleTouch ends
    e.stopImmediatePropagation();

    return false;
  }

  external.$(element).on('CornerstoneToolsTouchDrag', moveCallback);
  external.$(element).on('CornerstoneToolsTouchPinch', moveEndCallback);
  external.$(element).on('CornerstoneToolsTouchEnd', moveEndCallback);
  external.$(element).on('CornerstoneToolsTap', moveEndCallback);
  external.$(element).on('CornerstoneToolsTouchStart', stopImmediatePropagation);

  function toolDeactivatedCallback () {
    external.$(element).off('CornerstoneToolsTouchDrag', moveCallback);
    external.$(element).off('CornerstoneToolsTouchPinch', moveEndCallback);
    external.$(element).off('CornerstoneToolsTouchEnd', moveEndCallback);
    external.$(element).off('CornerstoneToolsTap', moveEndCallback);
    external.$(element).off('CornerstoneToolsTouchStart', stopImmediatePropagation);
    external.$(element).off('CornerstoneToolsToolDeactivated', toolDeactivatedCallback);

    handle.active = false;
    data.active = false;
    handle.x = eventData.currentPoints.image.x + distanceFromTouch.x;
    handle.y = eventData.currentPoints.image.y + distanceFromTouch.y;

    if (preventHandleOutsideImage) {
      handle.x = Math.max(handle.x, 0);
      handle.x = Math.min(handle.x, eventData.image.width);

      handle.y = Math.max(handle.y, 0);
      handle.y = Math.min(handle.y, eventData.image.height);
    }

    cornerstone.updateImage(element);
  }

  external.$(element).on('CornerstoneToolsToolDeactivated', toolDeactivatedCallback);
}
