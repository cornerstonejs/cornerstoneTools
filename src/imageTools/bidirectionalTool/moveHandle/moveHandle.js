import external from '../../../externalModules.js';
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

    const eventType = 'cornerstonetoolsmeasurementmodified';
    const modifiedEventData = {
      toolType,
      element,
      measurementData: data
    };

    external.cornerstone.triggerEvent(element, eventType, modifiedEventData);
  };

  element.addEventListener('cornerstonetoolsmousedrag', mouseDragCallback);

  const currentImage = external.cornerstone.getImage(element);
  const imageRenderedHandler = () => {
    const newImage = external.cornerstone.getImage(element);

    // Check if the rendered image changed during measurement modifying and stop it if so
    if (newImage.imageId !== currentImage.imageId) {
      mouseUpCallback();
    }
  };

    // Bind the event listener for image rendering
  element.addEventListener('cornerstoneimagerendered', imageRenderedHandler);

  const mouseUpCallback = () => {
    element.removeEventListener('cornerstonetoolsmousedrag', mouseDragCallback);
    element.removeEventListener('cornerstonetoolsmouseup', mouseUpCallback);
    element.removeEventListener('cornerstonetoolsmouseclick', mouseUpCallback);
    element.removeEventListener('cornerstoneimagerendered', imageRenderedHandler);
    external.cornerstone.updateImage(element);

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback();
    }
  };

  element.addEventListener('cornerstonetoolsmouseup', mouseUpCallback);
  element.addEventListener('cornerstonetoolsmouseclick', mouseUpCallback);
}
