import * as cornerstone from 'cornerstone-core';

export default function (mouseEventData, toolType, data, handle, doneMovingCallback, preventHandleOutsideImage) {
  const element = mouseEventData.element;
  const distanceFromTool = {
    x: handle.x - mouseEventData.currentPoints.image.x,
    y: handle.y - mouseEventData.currentPoints.image.y
  };

  function mouseDragCallback (e, eventData) {
    if (handle.hasMoved === false) {
      handle.hasMoved = true;
    }

    handle.active = true;
    handle.x = eventData.currentPoints.image.x + distanceFromTool.x;
    handle.y = eventData.currentPoints.image.y + distanceFromTool.y;

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

    $(element).trigger(eventType, modifiedEventData);
  }

  $(element).on('CornerstoneToolsMouseDrag', mouseDragCallback);

  function mouseUpCallback () {
    handle.active = false;
    $(element).off('CornerstoneToolsMouseDrag', mouseDragCallback);
    $(element).off('CornerstoneToolsMouseUp', mouseUpCallback);
    $(element).off('CornerstoneToolsMouseClick', mouseUpCallback);
    cornerstone.updateImage(element);

    if (typeof doneMovingCallback === 'function') {
      doneMovingCallback();
    }
  }

  $(element).on('CornerstoneToolsMouseUp', mouseUpCallback);
  $(element).on('CornerstoneToolsMouseClick', mouseUpCallback);
}
