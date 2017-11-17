import { external } from '../externalModules.js';
import anyHandlesOutsideImage from './anyHandlesOutsideImage.js';
import { removeToolState } from '../stateManagement/toolState.js';
import triggerEvent from '../util/triggerEvent.js';

export default function (touchEventData, data, toolData, toolType, deleteIfHandleOutsideImage, doneMovingCallback) {
  const element = touchEventData.element;
  const cornerstone = external.cornerstone;

  function touchDragCallback (e, eventData) {
    data.active = true;

    Object.keys(data.handles).forEach(function (name) {
      const handle = data.handles[name];

      if (handle.movesIndependently === true) {
        return;
      }

      handle.x += eventData.deltaPoints.image.x;
      handle.y += eventData.deltaPoints.image.y;
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

  external.$(element).on('CornerstoneToolsTouchDrag', touchDragCallback);

  function touchEndCallback (e, eventData) {
    // Console.log('touchMoveAllHandles touchEndCallback: ' + e.type);
    data.active = false;
    data.invalidated = false;

    external.$(element).off('CornerstoneToolsTouchDrag', touchDragCallback);
    external.$(element).off('CornerstoneToolsTouchPinch', touchEndCallback);
    external.$(element).off('CornerstoneToolsTouchPress', touchEndCallback);
    external.$(element).off('CornerstoneToolsTouchEnd', touchEndCallback);
    external.$(element).off('CornerstoneToolsDragEnd', touchEndCallback);
    external.$(element).off('CornerstoneToolsTap', touchEndCallback);

    // If any handle is outside the image, delete the tool data
    if (deleteIfHandleOutsideImage === true &&
            anyHandlesOutsideImage(eventData, data.handles)) {
      removeToolState(element, toolType, data);
    }

    cornerstone.updateImage(element);

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback(e, eventData);
    }
  }

  external.$(element).on('CornerstoneToolsTouchPinch', touchEndCallback);
  external.$(element).on('CornerstoneToolsTouchPress', touchEndCallback);
  external.$(element).on('CornerstoneToolsTouchEnd', touchEndCallback);
  external.$(element).on('CornerstoneToolsDragEnd', touchEndCallback);
  external.$(element).on('CornerstoneToolsTap', touchEndCallback);

  return true;
}
