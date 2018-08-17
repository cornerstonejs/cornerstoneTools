import EVENTS from '../events.js';
import external from '../externalModules.js';
import anyHandlesOutsideImage from './anyHandlesOutsideImage.js';
import { removeToolState } from '../stateManagement/toolState.js';
import triggerEvent from '../util/triggerEvent.js';

export default function (event, data, toolData, toolType, deleteIfHandleOutsideImage, doneMovingCallback) {
  const touchEventData = event.detail;
  const element = touchEventData.element;

  function touchDragCallback (e) {
    const eventData = e.detail;

    data.active = true;

    Object.keys(data.handles).forEach(function (name) {
      const handle = data.handles[name];

      if (handle.movesIndependently === true) {
        return;
      }

      handle.x += eventData.deltaPoints.image.x;
      handle.y += eventData.deltaPoints.image.y;
    });
    external.cornerstone.updateImage(element);

    const eventType = EVENTS.MEASUREMENT_MODIFIED;
    const modifiedEventData = {
      toolType,
      element,
      measurementData: data
    };

    triggerEvent(element, eventType, modifiedEventData);

    e.preventDefault();
    e.stopPropagation();
  }

  element.addEventListener(EVENTS.TOUCH_DRAG, touchDragCallback);

  function touchEndCallback (e) {
    const eventData = e.detail;

    // Console.log('touchMoveAllHandles touchEndCallback: ' + e.type);
    data.active = false;
    data.invalidated = false;

    element.removeEventListener(EVENTS.TOUCH_DRAG, touchDragCallback);

    element.removeEventListener(EVENTS.TOUCH_PINCH, touchEndCallback);
    element.removeEventListener(EVENTS.TOUCH_PRESS, touchEndCallback);
    element.removeEventListener(EVENTS.TOUCH_END, touchEndCallback);
    element.removeEventListener(EVENTS.TOUCH_DRAG_END, touchEndCallback);
    element.removeEventListener(EVENTS.TAP, touchEndCallback);

    // If any handle is outside the image, delete the tool data
    const handlesOutsideImage = anyHandlesOutsideImage(eventData, data.handles);

    if (deleteIfHandleOutsideImage === true && handlesOutsideImage === true) {
      removeToolState(element, toolType, data);
    }

    external.cornerstone.updateImage(element);

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback(e);
    }
  }

  element.addEventListener(EVENTS.TOUCH_PINCH, touchEndCallback);
  element.addEventListener(EVENTS.TOUCH_PRESS, touchEndCallback);
  element.addEventListener(EVENTS.TOUCH_END, touchEndCallback);
  element.addEventListener(EVENTS.TOUCH_DRAG_END, touchEndCallback);
  element.addEventListener(EVENTS.TAP, touchEndCallback);

  return true;
}
