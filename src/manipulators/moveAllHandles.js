import { external } from '../externalModules.js';
import anyHandlesOutsideImage from './anyHandlesOutsideImage.js';
import { removeToolState } from '../stateManagement/toolState.js';
import triggerEvent from '../util/triggerEvent.js';

export default function (mouseEventData, data, toolData, toolType, options, doneMovingCallback) {
  const cornerstone = external.cornerstone;
  const element = mouseEventData.element;

  function mouseDragCallback (e, eventData) {
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

    const eventType = 'CornerstoneToolsMeasurementModified';
    const modifiedEventData = {
      toolType,
      element,
      measurementData: data
    };

    triggerEvent(element, eventType, modifiedEventData);

    return false; // False = causes jquery to preventDefault() and stopPropagation() this event
  }

  external.$(element).on('CornerstoneToolsMouseDrag', mouseDragCallback);

  function mouseUpCallback (e, eventData) {
    data.invalidated = true;

    external.$(element).off('CornerstoneToolsMouseDrag', mouseDragCallback);
    external.$(element).off('CornerstoneToolsMouseUp', mouseUpCallback);
    external.$(element).off('CornerstoneToolsMouseClick', mouseUpCallback);

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

  external.$(element).on('CornerstoneToolsMouseUp', mouseUpCallback);
  external.$(element).on('CornerstoneToolsMouseClick', mouseUpCallback);

  return true;
}
