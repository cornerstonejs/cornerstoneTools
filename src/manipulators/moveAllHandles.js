import EVENTS from '../events.js';
import external from '../externalModules.js';
import anyHandlesOutsideImage from './anyHandlesOutsideImage.js';
import { removeToolState } from '../stateManagement/toolState.js';
import triggerEvent from '../util/triggerEvent.js';

export default function (e, data, toolData, toolType, options, doneMovingCallback) {
  const cornerstone = external.cornerstone;
  const mouseEventData = e.detail;
  const element = mouseEventData.element;

  function mouseDragCallback (e) {
    const eventData = e.detail;

    data.active = true;

    Object.keys(data.handles).forEach(function (name) {
      const handle = data.handles[name];

      if (handle.movesIndependently === true) {
        return;
      }

      handle.x += eventData.deltaPoints.image.x;
      handle.y += eventData.deltaPoints.image.y;

      if (options.preventHandleOutsideImage === true) {
        handle.x = Math.max(handle.x, 0);
        handle.x = Math.min(handle.x, eventData.image.width);

        handle.y = Math.max(handle.y, 0);
        handle.y = Math.min(handle.y, eventData.image.height);
      }
    });

    cornerstone.updateImage(element);

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

  element.addEventListener(EVENTS.MOUSE_DRAG, mouseDragCallback);

  function mouseUpCallback (e) {
    const eventData = e.detail;

    data.invalidated = true;

    element.removeEventListener(EVENTS.MOUSE_DRAG, mouseDragCallback);
    element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
    element.removeEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);

    // If any handle is outside the image, delete the tool data
    if (options.deleteIfHandleOutsideImage === true &&
            anyHandlesOutsideImage(eventData, data.handles)) {
      removeToolState(element, toolType, data);
    }

    cornerstone.updateImage(element);

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback();
    }
  }

  element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
  element.addEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);

  return true;
}
