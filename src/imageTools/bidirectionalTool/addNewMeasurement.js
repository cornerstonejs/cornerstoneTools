import external from './../../externalModules.js';
import { toolType } from './definitions.js';
import createNewMeasurement from './createNewMeasurement.js';
import mouseMoveCallback from './mouseMoveCallback.js';
import mouseDownCallback from './mouseDownCallback.js';
import doubleClickCallback from './doubleClickCallback.js';
import updatePerpendicularLineHandles from './updatePerpendicularLineHandles.js';
import moveNewHandle from '../../manipulators/moveNewHandle.js';
import anyHandlesOutsideImage from '../../manipulators/anyHandlesOutsideImage.js';
import { addToolState, removeToolState } from '../../stateManagement/toolState.js';

export default function (mouseEventData) {
  const { element } = mouseEventData;
  const $element = $(element);

  const imagePlane = external.cornerstone.metaData.get('imagePlaneModule', mouseEventData.image.imageId);
  let rowPixelSpacing;
  let colPixelSpacing;

  if (imagePlane) {
    rowPixelSpacing = imagePlane.rowPixelSpacing || imagePlane.rowImagePixelSpacing;
    colPixelSpacing = imagePlane.columnPixelSpacing || imagePlane.colImagePixelSpacing;
  } else {
    rowPixelSpacing = mouseEventData.image.rowPixelSpacing;
    colPixelSpacing = mouseEventData.image.columnPixelSpacing;
  }

  // LT-29 Disable Target Measurements when pixel spacing is not available
  if (!rowPixelSpacing || !colPixelSpacing) {
    return;
  }

  function doneCallback () {
    measurementData.active = false;
    external.cornerstone.updateImage(element);
  }

  const measurementData = createNewMeasurement(mouseEventData);

  measurementData.viewport = external.cornerstone.getViewport(element);

  const tool = cornerstoneTools[toolType];
  const config = tool.getConfiguration();
  const { mouseDownActivateCallback } = tool;

  // Associate this data with this imageId so we can render it and manipulate it
  addToolState(element, toolType, measurementData);

  const disableDefaultHandlers = () => {
    // Since we are dragging to another place to drop the end point, we can just activate
    // The end point and let the moveHandle move it for us.
    element.removeEventListener('cornerstonetoolsmousemove', mouseMoveCallback);
    element.removeEventListener('cornerstonetoolsmousedown', mouseDownCallback);
    element.removeEventListener('cornerstonetoolsmousedownactivate', mouseDownActivateCallback);
    element.removeEventListener('cornerstonetoolsmousedoubleclick', doubleClickCallback);
  };

  disableDefaultHandlers();

  // Update the perpendicular line handles position
  const updateHandler = (event) => updatePerpendicularLineHandles(event.detail, measurementData);

  element.addEventListener('cornerstonetoolsmousedrag', updateHandler);
  element.addEventListener('cornerstonetoolsmouseup', updateHandler);

  let cancelled = false;
  const cancelAction = () => {
    cancelled = true;
    removeToolState(element, toolType, measurementData);
  };

    // Add a flag for using Esc to cancel tool placement
  const keyDownHandler = (event) => {
    // If the Esc key was pressed, set the flag to true
    if (event.which === 27) {
      cancelAction();
    }

    // Don't propagate this keydown event so it can't interfere
    // With anything outside of this tool
    return false;
  };

    // Bind a one-time event listener for the Esc key
  $element.one('keydown', keyDownHandler);

  // Bind a mousedown handler to cancel the measurement if it's zero-sized
  const mousedownHandler = () => {
    const { start, end } = measurementData.handles;

    if (!external.cornerstoneMath.point.distance(start, end)) {
      cancelAction();
    }
  };

    // Bind a one-time event listener for mouse down
  $element.one('mousedown', mousedownHandler);

  // Keep the current image and create a handler for new rendered images
  const currentImage = external.cornerstone.getImage(element);
  const currentViewport = external.cornerstone.getViewport(element);
  const imageRenderedHandler = () => {
    const newImage = external.cornerstone.getImage(element);

    // Check if the rendered image changed during measurement creation and delete it if so
    if (newImage.imageId !== currentImage.imageId) {
      external.cornerstone.displayImage(element, currentImage, currentViewport);
      cancelAction();
      external.cornerstone.displayImage(element, newImage, currentViewport);
    }
  };

    // Bind the event listener for image rendering
  element.addEventListener('cornerstoneimagerendered', imageRenderedHandler);

  // Bind the tool deactivation and enlargement handlers
  element.addEventListener('cornerstonetoolstooldeactivated', cancelAction);
  $element.one('ohif.viewer.viewport.toggleEnlargement', cancelAction);

  external.cornerstone.updateImage(element);

  const timestamp = new Date().getTime();
  const { end, perpendicularStart } = measurementData.handles;

  moveNewHandle(mouseEventData, toolType, measurementData, end, () => {
    const { handles, longestDiameter, shortestDiameter } = measurementData;
    const hasHandlesOutside = anyHandlesOutsideImage(mouseEventData, handles);
    const longestDiameterSize = parseFloat(longestDiameter) || 0;
    const shortestDiameterSize = parseFloat(shortestDiameter) || 0;
    const isTooSmal = (longestDiameterSize < 1) || (shortestDiameterSize < 1);
    const isTooFast = (new Date().getTime() - timestamp) < 150;

    if (cancelled || hasHandlesOutside || isTooSmal || isTooFast) {
      // Delete the measurement
      measurementData.cancelled = true;
      removeToolState(element, toolType, measurementData);
    } else {
      // Set lesionMeasurementData Session
      config.getMeasurementLocationCallback(measurementData, mouseEventData, doneCallback);
    }

    // Unbind the Esc keydown hook
    $element.off('keydown', keyDownHandler);

    // Unbind the mouse down hook
    $element.off('mousedown', mousedownHandler);

    // Unbind the event listener for image rendering
    element.removeEventListener('cornerstoneimagerendered', imageRenderedHandler);

    // Unbind the tool deactivation and enlargement handlers
    element.removeEventListener('cornerstonetoolstooldeactivated', cancelAction);
    $element.off('ohif.viewer.viewport.toggleEnlargement', cancelAction);

    // Perpendicular line is not connected to long-line
    perpendicularStart.locked = false;

    // Unbind the handlers to update perpendicular line
    element.removeEventListener('cornerstonetoolsmousedrag', updateHandler);
    element.removeEventListener('cornerstonetoolsmouseup', updateHandler);

    // Disable the default handlers and re-enable again
    disableDefaultHandlers();
    element.addEventListener('cornerstonetoolsmousemove', mouseMoveCallback);
    element.addEventListener('cornerstonetoolsmousedown', mouseDownCallback);
    element.addEventListener('cornerstonetoolsmousedownactivate', mouseDownActivateCallback);
    element.addEventListener('cornerstonetoolsmousedoubleclick', doubleClickCallback);

    external.cornerstone.updateImage(element);
  });
}
