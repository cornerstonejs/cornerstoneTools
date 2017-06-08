import * as cornerstone from 'cornerstone-core';
import anyHandlesOutsideImage from './anyHandlesOutsideImage';
import { removeToolState } from '../stateManagement/toolState';

export default function (touchEventData, data, toolData, toolType, deleteIfHandleOutsideImage, doneMovingCallback) {
  const element = touchEventData.element;

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

    $(element).trigger(eventType, modifiedEventData);

    return false; // False = causes jquery to preventDefault() and stopPropagation() this event
  }

  $(element).on('CornerstoneToolsTouchDrag', touchDragCallback);

  function touchEndCallback (e, eventData) {
        // Console.log('touchMoveAllHandles touchEndCallback: ' + e.type);
    data.active = false;
    data.invalidated = false;

    $(element).off('CornerstoneToolsTouchDrag', touchDragCallback);
    $(element).off('CornerstoneToolsTouchPinch', touchEndCallback);
    $(element).off('CornerstoneToolsTouchPress', touchEndCallback);
    $(element).off('CornerstoneToolsTouchEnd', touchEndCallback);
    $(element).off('CornerstoneToolsDragEnd', touchEndCallback);
    $(element).off('CornerstoneToolsTap', touchEndCallback);

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

  $(element).on('CornerstoneToolsTouchPinch', touchEndCallback);
  $(element).on('CornerstoneToolsTouchPress', touchEndCallback);
  $(element).on('CornerstoneToolsTouchEnd', touchEndCallback);
  $(element).on('CornerstoneToolsDragEnd', touchEndCallback);
  $(element).on('CornerstoneToolsTap', touchEndCallback);

  return true;
}
