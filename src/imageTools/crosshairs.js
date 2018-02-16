import EVENTS from '../events.js';
import external from '../externalModules.js';
import loadHandlerManager from '../stateManagement/loadHandlerManager.js';
import { addToolState, getToolState, clearToolState } from '../stateManagement/toolState.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { imagePointToPatientPoint } from '../util/pointProjector.js';
import convertToVector3 from '../util/convertToVector3.js';
import { setToolOptions, getToolOptions } from '../toolOptions.js';

const toolType = 'crosshairs';

function chooseLocation (e) {
  const eventData = e.detail;

  e.stopImmediatePropagation(); // Prevent CornerstoneToolsTouchStartActive from killing any press events

  // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = getToolState(e.currentTarget, toolType);

  if (!toolData) {
    return;
  }

  // Get current element target information
  const cornerstone = external.cornerstone;
  const sourceElement = e.currentTarget;
  const sourceEnabledElement = cornerstone.getEnabledElement(sourceElement);
  const sourceImageId = sourceEnabledElement.image.imageId;
  const sourceImagePlane = cornerstone.metaData.get('imagePlaneModule', sourceImageId);

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
      const imagePlane = cornerstone.metaData.get('imagePlaneModule', imageId);

      // Skip if the image plane is not ready
      if (!imagePlane || !imagePlane.imagePositionPatient || !imagePlane.rowCosines || !imagePlane.columnCosines) {
        return;
      }

      const imagePosition = convertToVector3(imagePlane.imagePositionPatient);
      const row = convertToVector3(imagePlane.rowCosines);
      const column = convertToVector3(imagePlane.columnCosines);
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

function mouseUpCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  element.removeEventListener(EVENTS.MOUSE_DRAG, mouseDragCallback);
  element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
}

function mouseDownCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;
  const options = getToolOptions(toolType, element);

  if (isMouseButtonEnabled(eventData.which, options.mouseButtonMask)) {
    element.addEventListener(EVENTS.MOUSE_DRAG, mouseDragCallback);
    element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
    chooseLocation(e);

    e.preventDefault();
    e.stopPropagation();
  }
}

function mouseDragCallback (e) {
  chooseLocation(e);

  e.preventDefault();
  e.stopPropagation();
}

function enable (element, mouseButtonMask, synchronizationContext) {
  setToolOptions(toolType, element, { mouseButtonMask });

  // Clear any currently existing toolData
  clearToolState(element, toolType);

  addToolState(element, toolType, {
    synchronizationContext
  });

  element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);

  element.addEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);
}

// Disables the reference line tool for the given element
function disable (element) {
  element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);
}

// Module/private exports
const crosshairs = {
  activate: enable,
  deactivate: disable,
  enable,
  disable
};

function dragEndCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  element.removeEventListener(EVENTS.TOUCH_DRAG, dragCallback);
  element.removeEventListener(EVENTS.TOUCH_DRAG_END, dragEndCallback);
}

function dragStartCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  element.addEventListener(EVENTS.TOUCH_DRAG, dragCallback);
  element.addEventListener(EVENTS.TOUCH_DRAG_END, dragEndCallback);
  chooseLocation(e);

  return false;
}

function dragCallback (e) {
  chooseLocation(e);

  e.preventDefault();
  e.stopPropagation();
}

function enableTouch (element, synchronizationContext) {
  // Clear any currently existing toolData
  clearToolState(element, toolType);

  addToolState(element, toolType, {
    synchronizationContext
  });

  element.removeEventListener(EVENTS.TOUCH_START, dragStartCallback);

  element.addEventListener(EVENTS.TOUCH_START, dragStartCallback);
}

// Disables the reference line tool for the given element
function disableTouch (element) {
  element.removeEventListener(EVENTS.TOUCH_START, dragStartCallback);
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
