import external from '../../../externalModules.js';
import EVENTS from '../../../events.js';
import setHandlesPosition from './setHandlesPosition.js';

export default function (mouseEventData, toolType, data, handle, doneMovingCallback, preventHandleOutsideImage) {
  const element = mouseEventData.element;
  const distanceFromTool = {
    x: handle.x - mouseEventData.currentPoints.image.x,
    y: handle.y - mouseEventData.currentPoints.image.y
  };

  const mouseDragCallback = (event) => {
    const eventData = event.detail;

    handle.active = true;

    if (handle.index === undefined || handle.index === null) {
      handle.x = eventData.currentPoints.image.x + distanceFromTool.x;
      handle.y = eventData.currentPoints.image.y + distanceFromTool.y;
    } else {
      setHandlesPosition(handle, eventData, data);
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
      measurementData: data
    };

    external.cornerstone.triggerEvent(element, eventType, modifiedEventData);
  };

  element.addEventListener(EVENTS.MOUSE_DRAG, mouseDragCallback);

  const currentImage = external.cornerstone.getImage(element);
  const imageRenderedHandler = () => {
    const newImage = external.cornerstone.getImage(element);

    // Check if the rendered image changed during measurement modifying and stop it if so
    if (newImage.imageId !== currentImage.imageId) {
      mouseUpCallback();
    }
  };

  // Bind the event listener for image rendering
  element.addEventListener(external.cornerstone.EVENTS.IMAGE_RENDERED, imageRenderedHandler);

  const mouseUpCallback = () => {
    element.removeEventListener(EVENTS.MOUSE_DRAG, mouseDragCallback);
    element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
    element.removeEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
    element.removeEventListener(external.cornerstone.EVENTS.IMAGE_RENDERED, imageRenderedHandler);
    external.cornerstone.updateImage(element);

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback();
    }
  };

  element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
  element.addEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
}
