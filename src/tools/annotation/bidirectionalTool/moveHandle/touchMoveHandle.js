import external from './../../../../externalModules.js';
import EVENTS from './../../../../events.js';
import setHandlesPosition from './setHandlesPosition.js';

const touchEndEvents = [
  EVENTS.TOUCH_END,
  EVENTS.TOUCH_DRAG_END,
  EVENTS.TOUCH_PINCH,
  EVENTS.TOUCH_PRESS,
  EVENTS.TAP,
];

export default function(
  mouseEventData,
  toolType,
  data,
  handle,
  doneMovingCallback,
  preventHandleOutsideImage
) {
  const element = mouseEventData.element;
  const distanceFromTool = {
    x: handle.x - mouseEventData.currentPoints.image.x,
    y: handle.y - mouseEventData.currentPoints.image.y,
  };

  const touchDragCallback = event => {
    const eventData = event.detail;

    handle.active = true;
    handle.hasMoved = true;

    if (handle.index === undefined || handle.index === null) {
      handle.x = eventData.currentPoints.image.x + distanceFromTool.x;
      handle.y = eventData.currentPoints.image.y + distanceFromTool.y;
    } else {
      setHandlesPosition(handle, eventData, data, distanceFromTool);
    }

    if (preventHandleOutsideImage) {
      handle.x = Math.max(handle.x, 0);
      handle.x = Math.min(handle.x, eventData.image.width);

      handle.y = Math.max(handle.y, 0);
      handle.y = Math.min(handle.y, eventData.image.height);
    }

    external.cornerstone.updateImage(element);

    const eventType = EVENTS.MEASUREMENT_MODIFIED;
    const modifiedEventData = {
      toolType,
      element,
      measurementData: data,
    };

    external.cornerstone.triggerEvent(element, eventType, modifiedEventData);
  };

  element.addEventListener(EVENTS.TOUCH_DRAG, touchDragCallback);

  const touchEndCallback = () => {
    element.removeEventListener(EVENTS.TOUCH_DRAG, touchDragCallback);
    touchEndEvents.forEach(eventType => {
      element.removeEventListener(eventType, touchEndCallback);
    });

    external.cornerstone.updateImage(element);

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback();
    }
  };

  touchEndEvents.forEach(eventType => {
    element.addEventListener(eventType, touchEndCallback);
  });
}
