import external from './../../../externalModules.js';
import EVENTS from './../../../events.js';
import { moveNewHandle } from './../../../manipulators/index.js';
import anyHandlesOutsideImage from './../../../manipulators/anyHandlesOutsideImage.js';
import calculateLongestAndShortestDiameters from './utils/calculateLongestAndShortestDiameters.js';
import {
  addToolState,
  removeToolState,
} from './../../../stateManagement/toolState.js';

export default function(evt, interactionType) {
  const eventData = evt.detail;
  const { element, image } = eventData;
  const config = this.configuration;

  if (checkPixelSpacing(image)) {
    return;
  }

  const measurementData = this.createNewMeasurement(eventData);

  const doneCallback = () => {
    measurementData.active = false;
    external.cornerstone.updateImage(element);

    const measurementModifiedHandler = () => {
      const modifiedEventData = {
        toolName: this.name,
        element,
        measurementData,
      };

      calculateLongestAndShortestDiameters(eventData, measurementData);

      external.cornerstone.triggerEvent(
        element,
        EVENTS.MEASUREMENT_MODIFIED,
        modifiedEventData
      );

      element.removeEventListener(
        external.cornerstone.EVENTS.IMAGE_RENDERED,
        measurementModifiedHandler
      );
    };

    // Wait on image render before triggering the modified event
    element.addEventListener(
      external.cornerstone.EVENTS.IMAGE_RENDERED,
      measurementModifiedHandler
    );
  };

  // Associate this data with this imageId so we can render it and manipulate it
  addToolState(element, this.name, measurementData);
  external.cornerstone.updateImage(element);

  const timestamp = new Date().getTime();
  const { end, perpendicularStart } = measurementData.handles;

  moveNewHandle(
    eventData,
    this.name,
    measurementData,
    end,
    {
      doneMovingCallback: () => {
        const { handles, longestDiameter, shortestDiameter } = measurementData;
        const hasHandlesOutside = anyHandlesOutsideImage(eventData, handles);
        const longestDiameterSize = parseFloat(longestDiameter) || 0;
        const shortestDiameterSize = parseFloat(shortestDiameter) || 0;
        const isTooSmal = longestDiameterSize < 1 || shortestDiameterSize < 1;
        const isTooFast = new Date().getTime() - timestamp < 150;

        if (hasHandlesOutside || isTooSmal || isTooFast) {
          // Delete the measurement
          measurementData.cancelled = true;
          removeToolState(element, this.name, measurementData);
        } else {
          // Set lesionMeasurementData Session
          config.getMeasurementLocationCallback(
            measurementData,
            eventData,
            doneCallback
          );
        }

        // Perpendicular line is not connected to long-line
        perpendicularStart.locked = false;

        external.cornerstone.updateImage(element);
      },
    },
    interactionType
  );
}

const checkPixelSpacing = image => {
  const imagePlane = external.cornerstone.metaData.get(
    'imagePlaneModule',
    image.imageId
  );
  let rowPixelSpacing = image.rowPixelSpacing;
  let colPixelSpacing = image.columnPixelSpacing;

  if (imagePlane) {
    rowPixelSpacing =
      imagePlane.rowPixelSpacing || imagePlane.rowImagePixelSpacing;
    colPixelSpacing =
      imagePlane.columnPixelSpacing || imagePlane.colImagePixelSpacing;
  }

  // LT-29 Disable Target Measurements when pixel spacing is not available
  return !rowPixelSpacing || !colPixelSpacing;
};
