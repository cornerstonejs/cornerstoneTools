import external from './../../../externalModules.js';
import EVENTS from './../../../events.js';
import { moveNewHandle } from './../../../manipulators/index.js';
import anyHandlesOutsideImage from './../../../manipulators/anyHandlesOutsideImage.js';
import {
  addToolState,
  removeToolState,
} from './../../../stateManagement/toolState.js';
import triggerEvent from '../../../util/triggerEvent.js';
import getActiveTool from '../../../util/getActiveTool';
import BaseAnnotationTool from '../../base/BaseAnnotationTool';
import updatePerpendicularLineHandles from './utils/updatePerpendicularLineHandles.js';

/**
 * We override `addNewMeasurement` as it's the only way to use a manipulator other than
 * `moveHandle` or `moveNewHandle`. `addNewMeasurement` is called by an "eventDispatcher"
 * and is responsible for creating new measurement data.
 *
 * @param {*} evt
 * @param {*} interactionType
 * @returns {undefined}
 */
export default function(evt, interactionType) {
  const eventData = evt.detail;
  const { element, image, buttons } = eventData;

  const measurementData = this.createNewMeasurement(eventData);

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
    {},
    interactionType,
    () => {
      const { handles, longestDiameter, shortestDiameter } = measurementData;
      const hasHandlesOutside = anyHandlesOutsideImage(eventData, handles);
      const longestDiameterSize = parseFloat(longestDiameter) || 0;
      const shortestDiameterSize = parseFloat(shortestDiameter) || 0;
      const isTooSmall = longestDiameterSize < 1 || shortestDiameterSize < 1;
      const isTooFast = new Date().getTime() - timestamp < 150;

      if (hasHandlesOutside || isTooSmall || isTooFast) {
        // Delete the measurement
        measurementData.cancelled = true;
        removeToolState(element, this.name, measurementData);
      }

      // Update perpendicular line and disconnect it from the long-line
      updatePerpendicularLineHandles(eventData, measurementData);
      perpendicularStart.locked = false;

      measurementData.invalidated = true;

      external.cornerstone.updateImage(element);

      const activeTool = getActiveTool(element, buttons, interactionType);

      if (activeTool instanceof BaseAnnotationTool) {
        activeTool.updateCachedStats(image, element, measurementData);
      }

      const modifiedEventData = {
        toolType: this.name,
        element,
        measurementData,
      };

      triggerEvent(element, EVENTS.MEASUREMENT_MODIFIED, modifiedEventData);
      triggerEvent(element, EVENTS.MEASUREMENT_COMPLETED, modifiedEventData);
    }
  );
}
