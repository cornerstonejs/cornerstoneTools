import EVENTS from '../events.js';
import external from '../externalModules.js';
import triggerEvent from '../util/triggerEvent.js';
import { clipToBox } from '../util/clip.js';

export default function (eventData, toolType, data, handle, doneMovingCallback, preventHandleOutsideImage) {
  // Console.log('moveNewHandleTouch');
  const element = eventData.element;
  const imageCoords = external.cornerstone.pageToPixel(element, eventData.currentPoints.page.x, eventData.currentPoints.page.y + 50);
  const distanceFromTouch = {
    x: handle.x - imageCoords.x,
    y: handle.y - imageCoords.y
  };

  handle.active = true;
  data.active = true;

  function moveCallback (e) {
    const eventData = e.detail;

    handle.x = eventData.currentPoints.image.x + distanceFromTouch.x;
    handle.y = eventData.currentPoints.image.y + distanceFromTouch.y;

    if (preventHandleOutsideImage) {
      clipToBox(handle, eventData.image);
    }

    external.cornerstone.updateImage(element);

    const eventType = EVENTS.MEASUREMENT_MODIFIED;
    const modifiedEventData = {
      toolType,
      element,
      measurementData: data
    };

    triggerEvent(element, eventType, modifiedEventData);
  }

  function moveEndCallback (e) {
    const eventData = e.detail;

    element.removeEventListener(EVENTS.TOUCH_DRAG, moveCallback);
    element.removeEventListener(EVENTS.TOUCH_PINCH, moveEndCallback);
    element.removeEventListener(EVENTS.TOUCH_END, moveEndCallback);
    element.removeEventListener(EVENTS.TAP, moveEndCallback);
    element.removeEventListener(EVENTS.TOUCH_START, stopImmediatePropagation);
    element.removeEventListener(EVENTS.TOOL_DEACTIVATED, toolDeactivatedCallback);

    if (e.type === EVENTS.TOUCH_PINCH || e.type === EVENTS.TOUCH_PRESS) {
      handle.active = false;
      external.cornerstone.updateImage(element);
      doneMovingCallback();

      return;
    }

    handle.active = false;
    data.active = false;
    handle.x = eventData.currentPoints.image.x + distanceFromTouch.x;
    handle.y = eventData.currentPoints.image.y + distanceFromTouch.y;

    if (preventHandleOutsideImage) {
      clipToBox(handle, eventData.image);
    }

    external.cornerstone.updateImage(element);

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

  element.addEventListener(EVENTS.TOUCH_DRAG, moveCallback);
  element.addEventListener(EVENTS.TOUCH_PINCH, moveEndCallback);
  element.addEventListener(EVENTS.TOUCH_END, moveEndCallback);
  element.addEventListener(EVENTS.TAP, moveEndCallback);
  element.addEventListener(EVENTS.TOUCH_START, stopImmediatePropagation);

  function toolDeactivatedCallback () {
    element.removeEventListener(EVENTS.TOUCH_DRAG, moveCallback);
    element.removeEventListener(EVENTS.TOUCH_PINCH, moveEndCallback);
    element.removeEventListener(EVENTS.TOUCH_END, moveEndCallback);
    element.removeEventListener(EVENTS.TAP, moveEndCallback);
    element.removeEventListener(EVENTS.TOUCH_START, stopImmediatePropagation);
    element.removeEventListener(EVENTS.TOOL_DEACTIVATED, toolDeactivatedCallback);

    handle.active = false;
    data.active = false;
    handle.x = eventData.currentPoints.image.x + distanceFromTouch.x;
    handle.y = eventData.currentPoints.image.y + distanceFromTouch.y;

    if (preventHandleOutsideImage) {
      clipToBox(handle, eventData.image);
    }

    external.cornerstone.updateImage(element);
  }

  element.addEventListener(EVENTS.TOOL_DEACTIVATED, toolDeactivatedCallback);
}
