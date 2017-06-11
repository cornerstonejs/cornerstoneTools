import * as cornerstone from 'cornerstone-core';
import loadHandlerManager from '../stateManagement/loadHandlerManager.js';
import { addToolState, getToolState, clearToolState } from '../stateManagement/toolState.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { imagePointToPatientPoint } from '../util/pointProjector.js';

const toolType = 'crosshairs';

function chooseLocation (e, eventData) {
  e.stopImmediatePropagation(); // Prevent CornerstoneToolsTouchStartActive from killing any press events

    // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = getToolState(e.currentTarget, toolType);

  if (!toolData) {
    return;
  }

    // Get current element target information
  const sourceElement = e.currentTarget;
  const sourceEnabledElement = cornerstone.getEnabledElement(sourceElement);
  const sourceImageId = sourceEnabledElement.image.imageId;
  const sourceImagePlane = cornerstone.metaData.get('imagePlane', sourceImageId);

    // Get currentPoints from mouse cursor on selected element
  const sourceImagePoint = eventData.currentPoints.image;

    // Transfer this to a patientPoint given imagePlane metadata
  const patientPoint = imagePointToPatientPoint(sourceImagePoint, sourceImagePlane);

    // Get the enabled elements associated with this synchronization context
  const syncContext = toolData.data[0].synchronizationContext;
  const enabledElements = syncContext.getSourceElements();

    // Iterate over each synchronized element
  enabledElements.forEach(function (targetElement) {
        // Don't do anything if the target is the same as the source
    if (targetElement === sourceElement) {
      return;
    }

    let minDistance = Number.MAX_VALUE;
    let newImageIdIndex = -1;

    const stackToolDataSource = getToolState(targetElement, 'stack');

    if (stackToolDataSource === undefined) {
      return;
    }

    const stackData = stackToolDataSource.data[0];

        // Find within the element's stack the closest image plane to selected location
    stackData.imageIds.forEach(function (imageId, index) {
      const imagePlane = cornerstone.metaData.get('imagePlane', imageId);
      const imagePosition = imagePlane.imagePositionPatient;
      const row = imagePlane.rowCosines.clone();
      const column = imagePlane.columnCosines.clone();
      const normal = column.clone().cross(row.clone());
      const distance = Math.abs(normal.clone().dot(imagePosition) - normal.clone().dot(patientPoint));
            // Console.log(index + '=' + distance);

      if (distance < minDistance) {
        minDistance = distance;
        newImageIdIndex = index;
      }
    });

    if (newImageIdIndex === stackData.currentImageIdIndex) {
      return;
    }

        // Switch the loaded image to the required image
    if (newImageIdIndex !== -1 && stackData.imageIds[newImageIdIndex] !== undefined) {
      const startLoadingHandler = loadHandlerManager.getStartLoadHandler();
      const endLoadingHandler = loadHandlerManager.getEndLoadHandler();
      const errorLoadingHandler = loadHandlerManager.getErrorLoadingHandler();

      if (startLoadingHandler) {
        startLoadingHandler(targetElement);
      }

      let loader;

      if (stackData.preventCache === true) {
        loader = cornerstone.loadImage(stackData.imageIds[newImageIdIndex]);
      } else {
        loader = cornerstone.loadAndCacheImage(stackData.imageIds[newImageIdIndex]);
      }

      loader.then(function (image) {
        const viewport = cornerstone.getViewport(targetElement);

        stackData.currentImageIdIndex = newImageIdIndex;
        cornerstone.displayImage(targetElement, image, viewport);
        if (endLoadingHandler) {
          endLoadingHandler(targetElement, image);
        }
      }, function (error) {
        const imageId = stackData.imageIds[newImageIdIndex];

        if (errorLoadingHandler) {
          errorLoadingHandler(targetElement, imageId, error);
        }
      });
    }
  });
}

function mouseUpCallback (e, eventData) {
  $(eventData.element).off('CornerstoneToolsMouseDrag', mouseDragCallback);
  $(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
}

function mouseDownCallback (e, eventData) {
  if (isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
    $(eventData.element).on('CornerstoneToolsMouseDrag', mouseDragCallback);
    $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
    chooseLocation(e, eventData);

    return false; // False = cases jquery to preventDefault() and stopPropagation() this event
  }
}

function mouseDragCallback (e, eventData) {
  chooseLocation(e, eventData);

  return false; // False = causes jquery to preventDefault() and stopPropagation() this event
}

function enable (element, mouseButtonMask, synchronizationContext) {
  const eventData = {
    mouseButtonMask
  };

    // Clear any currently existing toolData
  clearToolState(element, toolType);

  addToolState(element, toolType, {
    synchronizationContext
  });

  $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);

  $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);
}

// Disables the reference line tool for the given element
function disable (element) {
  $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
}

// Module/private exports
const crosshairs = {
  activate: enable,
  deactivate: disable,
  enable,
  disable
};

function dragEndCallback (e, eventData) {
  $(eventData.element).off('CornerstoneToolsTouchDrag', dragCallback);
  $(eventData.element).off('CornerstoneToolsDragEnd', dragEndCallback);
}

function dragStartCallback (e, eventData) {
  $(eventData.element).on('CornerstoneToolsTouchDrag', dragCallback);
  $(eventData.element).on('CornerstoneToolsDragEnd', dragEndCallback);
  chooseLocation(e, eventData);

  return false;
}

function dragCallback (e, eventData) {
  chooseLocation(e, eventData);

  return false; // False = causes jquery to preventDefault() and stopPropagation() this event
}

function enableTouch (element, synchronizationContext) {
    // Clear any currently existing toolData
  clearToolState(element, toolType);

  addToolState(element, toolType, {
    synchronizationContext
  });

  $(element).off('CornerstoneToolsTouchStart', dragStartCallback);

  $(element).on('CornerstoneToolsTouchStart', dragStartCallback);
}

// Disables the reference line tool for the given element
function disableTouch (element) {
  $(element).off('CornerstoneToolsTouchStart', dragStartCallback);
}

const crosshairsTouch = {
  activate: enableTouch,
  deactivate: disableTouch,
  enable: enableTouch,
  disable: disableTouch
};

export {
  crosshairs,
  crosshairsTouch
};
