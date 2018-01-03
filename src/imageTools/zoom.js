import EVENTS from '../events.js';
import external from '../externalModules.js';
import simpleMouseButtonTool from './simpleMouseButtonTool.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import mouseWheelTool from './mouseWheelTool.js';
import touchPinchTool from './touchPinchTool.js';
import touchDragTool from './touchDragTool.js';
import { getToolOptions } from '../toolOptions.js';

const toolType = 'zoom';
let startPoints;

function changeViewportScale (viewport, ticks) {
  const config = zoom.getConfiguration();
  const pow = 1.7;

  const oldFactor = Math.log(viewport.scale) / Math.log(pow);
  const factor = oldFactor + ticks;

  const scale = Math.pow(pow, factor);

  if (config.maxScale && scale > config.maxScale) {
    viewport.scale = config.maxScale;
  } else if (config.minScale && scale < config.minScale) {
    viewport.scale = config.minScale;
  } else {
    viewport.scale = scale;
  }

  return viewport;
}

function boundPosition (position, width, height) {
  position.x = Math.max(position.x, 0);
  position.y = Math.max(position.y, 0);
  position.x = Math.min(position.x, width);
  position.y = Math.min(position.y, height);

  return position;
}

function correctShift (shift, viewport) {
  // Apply Flips
  if (viewport.hflip) {
    shift.x *= -1;
  }

  if (viewport.vflip) {
    shift.y *= -1;
  }

  // Apply rotations
  if (viewport.rotation !== 0) {
    const angle = viewport.rotation * Math.PI / 180;

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const newX = shift.x * cosA - shift.y * sinA;
    const newY = shift.x * sinA + shift.y * cosA;

    shift.x = newX;
    shift.y = newY;
  }

  return shift;
}

function defaultStrategy (eventData, ticks) {
  const cornerstone = external.cornerstone;
  const element = eventData.element;

  // Calculate the new scale factor based on how far the mouse has changed
  const viewport = changeViewportScale(eventData.viewport, ticks);

  cornerstone.setViewport(element, viewport);

  // Now that the scale has been updated, determine the offset we need to apply to the center so we can
  // Keep the original start location in the same position
  const newCoords = cornerstone.pageToPixel(element, eventData.startPoints.page.x, eventData.startPoints.page.y);

  // The shift we will use is the difference between the original image coordinates of the point we've selected
  // And the image coordinates of the same point on the page after the viewport scaling above has been performed
  // This shift is in image coordinates, and is designed to keep the target location fixed on the page.
  let shift = {
    x: eventData.startPoints.image.x - newCoords.x,
    y: eventData.startPoints.image.y - newCoords.y
  };

    // Correct the required shift using the viewport rotation and flip parameters
  shift = correctShift(shift, viewport);

  // Apply the shift to the Viewport's translation setting
  viewport.translation.x -= shift.x;
  viewport.translation.y -= shift.y;

  // Update the Viewport with the new translation value
  cornerstone.setViewport(element, viewport);
}

function translateStrategy (eventData, ticks) {
  const element = eventData.element;
  const image = eventData.image;
  const config = zoom.getConfiguration();

  // Calculate the new scale factor based on how far the mouse has changed
  // Note that in this case we don't need to update the viewport after the initial
  // Zoom step since we aren't don't intend to keep the target position static on
  // The page
  const viewport = changeViewportScale(eventData.viewport, ticks);

  // Define the default shift to take place during this zoom step
  const shift = {
    x: 0,
    y: 0
  };

    // Define the parameters for the translate strategy
  const translateSpeed = 8;
  const outwardsMinScaleToTranslate = 3;
  const minTranslation = 0.01;

  if (ticks < 0) {
    // Zoom outwards from the image center
    if (viewport.scale < outwardsMinScaleToTranslate) {
      // If the current translation is smaller than the minimum desired translation,
      // Set the translation to zero
      if (Math.abs(viewport.translation.x) < minTranslation) {
        viewport.translation.x = 0;
      } else {
        shift.x = viewport.translation.x / translateSpeed;
      }

      // If the current translation is smaller than the minimum desired translation,
      // Set the translation to zero
      if (Math.abs(viewport.translation.y) < minTranslation) {
        viewport.translation.y = 0;
      } else {
        shift.y = viewport.translation.y / translateSpeed;
      }
    }
  } else {
    // Zoom inwards to the current image point

    // Identify the coordinates of the point the user is trying to zoom into
    // If we are not allowed to zoom outside the image, bound the user-selected position to
    // A point inside the image
    if (config && config.preventZoomOutsideImage) {
      startPoints.image = boundPosition(startPoints.image, image.width, image.height);
    }

    // Calculate the translation value that would place the desired image point in the center
    // Of the viewport
    let desiredTranslation = {
      x: image.width / 2 - startPoints.image.x,
      y: image.height / 2 - startPoints.image.y
    };

    // Correct the target location using the viewport rotation and flip parameters
    desiredTranslation = correctShift(desiredTranslation, viewport);

    // Calculate the difference between the current viewport translation value and the
    // Final desired translation values
    const distanceToDesired = {
      x: viewport.translation.x - desiredTranslation.x,
      y: viewport.translation.y - desiredTranslation.y
    };

    // If the current translation is smaller than the minimum desired translation,
    // Stop translating in the x-direction
    if (Math.abs(distanceToDesired.x) < minTranslation) {
      viewport.translation.x = desiredTranslation.x;
    } else {
      // Otherwise, shift the viewport by one step
      shift.x = distanceToDesired.x / translateSpeed;
    }

    // If the current translation is smaller than the minimum desired translation,
    // Stop translating in the y-direction
    if (Math.abs(distanceToDesired.y) < minTranslation) {
      viewport.translation.y = desiredTranslation.y;
    } else {
      // Otherwise, shift the viewport by one step
      shift.y = distanceToDesired.y / translateSpeed;
    }
  }

  // Apply the shift to the Viewport's translation setting
  viewport.translation.x -= shift.x;
  viewport.translation.y -= shift.y;

  // Update the Viewport with the new translation value
  external.cornerstone.setViewport(element, viewport);
}

function zoomToCenterStrategy (eventData, ticks) {
  const element = eventData.element;

  // Calculate the new scale factor based on how far the mouse has changed
  const viewport = changeViewportScale(eventData.viewport, ticks);

  external.cornerstone.setViewport(element, viewport);
}

function mouseUpCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  element.removeEventListener(EVENTS.MOUSE_DRAG, dragCallback);
  element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
  element.removeEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
}

function mouseDownCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;
  const options = getToolOptions(toolType, element);

  if (isMouseButtonEnabled(eventData.which, options.mouseButtonMask)) {
    startPoints = eventData.startPoints; // Used for translateStrategy
    element.addEventListener(EVENTS.MOUSE_DRAG, dragCallback);
    element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);

    e.preventDefault();
    e.stopPropagation();
  }
}

function dragCallback (e) {
  const eventData = e.detail;

  if (!eventData.deltaPoints.page.y) {
    return false;
  }

  const ticks = eventData.deltaPoints.page.y / 100;

  zoom.strategy(eventData, ticks);

  e.preventDefault();
  e.stopPropagation();
}

function mouseWheelCallback (e) {
  const eventData = e.detail;
  let ticks = -eventData.direction / 4;

  // Allow inversion of the mouse wheel scroll via a configuration option
  const config = zoom.getConfiguration();

  if (config && config.invert) {
    ticks *= -1;
  }

  const viewport = changeViewportScale(eventData.viewport, ticks);

  external.cornerstone.setViewport(eventData.element, viewport);
}

function touchPinchCallback (e) {
  const eventData = e.detail;
  const cornerstone = external.cornerstone;
  const config = zoom.getConfiguration();
  const viewport = eventData.viewport;
  const element = eventData.element;

  // Change the scale based on the pinch gesture's scale change
  viewport.scale += eventData.scaleChange * viewport.scale;
  if (config.maxScale && viewport.scale > config.maxScale) {
    viewport.scale = config.maxScale;
  } else if (config.minScale && viewport.scale < config.minScale) {
    viewport.scale = config.minScale;
  }

  cornerstone.setViewport(element, viewport);

  // Now that the scale has been updated, determine the offset we need to apply to the center so we can
  // Keep the original start location in the same position
  const newCoords = cornerstone.pageToPixel(element, eventData.startPoints.page.x, eventData.startPoints.page.y);
  let shift = {
    x: eventData.startPoints.image.x - newCoords.x,
    y: eventData.startPoints.image.y - newCoords.y
  };

  shift = correctShift(shift, viewport);
  viewport.translation.x -= shift.x;
  viewport.translation.y -= shift.y;
  cornerstone.setViewport(element, viewport);
}

const zoom = simpleMouseButtonTool(mouseDownCallback, toolType);

zoom.strategies = {
  default: defaultStrategy,
  translate: translateStrategy,
  zoomToCenter: zoomToCenterStrategy
};

zoom.strategy = defaultStrategy;

const zoomWheel = mouseWheelTool(mouseWheelCallback);
const zoomTouchPinch = touchPinchTool(touchPinchCallback);
const zoomTouchDrag = touchDragTool(dragCallback, toolType);

export {
  zoom,
  zoomWheel,
  zoomTouchPinch,
  zoomTouchDrag
};
