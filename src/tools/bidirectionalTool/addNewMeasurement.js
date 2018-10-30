import external from './../../externalModules.js';
import moveNewHandle from '../../manipulators/moveNewHandle.js';
import moveNewHandleTouch from '../../manipulators/moveNewHandleTouch.js';
import anyHandlesOutsideImage from '../../manipulators/anyHandlesOutsideImage.js';
import { addToolState, removeToolState } from '../../stateManagement/toolState.js';

export default function (evt, interactionType) {
  const eventData = evt.detail;
  const { element, image } = eventData;

  if (checkPixelSpacing(image)) {
    return;
  }

  // MoveHandle, moveNewHandle, moveHandleTouch, and moveNewHandleTouch
  // All take the same parameters, but register events differentlIy.
  const handleMover =
      interactionType === 'Mouse' ? moveNewHandle : moveNewHandleTouch;

  const measurementData = this.createNewMeasurement(eventData);

  // Associate this data with this imageId so we can render it and manipulate it
  addToolState(element, this.name, measurementData);
  external.cornerstone.updateImage(element);

  const timestamp = new Date().getTime();
  const { end, perpendicularStart } = measurementData.handles;

  handleMover(
    eventData,
    this.name,
    measurementData,
    end,
    () => {
      const { handles, longestDiameter, shortestDiameter } = measurementData;
      const hasHandlesOutside = anyHandlesOutsideImage(eventData, handles);
      const longestDiameterSize = parseFloat(longestDiameter) || 0;
      const shortestDiameterSize = parseFloat(shortestDiameter) || 0;
      const isTooSmal = (longestDiameterSize < 1) || (shortestDiameterSize < 1);
      const isTooFast = (new Date().getTime() - timestamp) < 150;

      if (hasHandlesOutside || isTooSmal || isTooFast) {
      // Delete the measurement
        measurementData.cancelled = true;
        removeToolState(element, this.name, measurementData);
      }

      // Perpendicular line is not connected to long-line
      perpendicularStart.locked = false;

      external.cornerstone.updateImage(element);
    });
}

const checkPixelSpacing = (image) => {
  const imagePlane = external.cornerstone.metaData.get('imagePlaneModule', image.imageId);
  let rowPixelSpacing = image.rowPixelSpacing;
  let colPixelSpacing = image.columnPixelSpacing;

  if (imagePlane) {
    rowPixelSpacing = imagePlane.rowPixelSpacing || imagePlane.rowImagePixelSpacing;
    colPixelSpacing = imagePlane.columnPixelSpacing || imagePlane.colImagePixelSpacing;
  }

  // LT-29 Disable Target Measurements when pixel spacing is not available
  return (!rowPixelSpacing || !colPixelSpacing);
};
