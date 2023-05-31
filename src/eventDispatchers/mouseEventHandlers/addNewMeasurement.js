import EVENTS from '../../events.js';
import external from '../../externalModules.js';
import {
  addToolState,
  removeToolState,
} from '../../stateManagement/toolState.js';
import { moveHandle, moveNewHandle } from '../../manipulators/index.js';
import { getLogger } from '../../util/logger.js';
import triggerEvent from '../../util/triggerEvent.js';

const logger = getLogger('eventDispatchers:mouseEventHandlers');

export default function(evt, tool) {
  logger.log('addNewMeasurement');

  evt.preventDefault();
  evt.stopPropagation();
  const eventData = evt.detail;
  const element = eventData.element;
  const measurementData = tool.createNewMeasurement(eventData);

  if (!measurementData) {
    return;
  }

  addToolState(element, tool.name, measurementData);

  external.cornerstone.updateImage(element);

  const handleMover =
    Object.keys(measurementData.handles).length === 1
      ? moveHandle
      : moveNewHandle;

  const timestamp = new Date().getTime();

  handleMover(
    eventData,
    tool.name,
    measurementData,
    measurementData.handles.end,
    tool.options,
    'mouse',
    success => {
      if (measurementData.cancelled) {
        return;
      }

      const hasThreshold =
        tool.configuration &&
        Object(tool.configuration).hasOwnProperty(
          'measurementCreationThreshold'
        );

      const isTooFast = hasThreshold
        ? new Date().getTime() - timestamp <
          tool.configuration.measurementCreationThreshold
        : false;

      if (success && isTooFast === false) {
        const eventType = EVENTS.MEASUREMENT_COMPLETED;
        const eventData = {
          toolName: tool.name,
          toolType: tool.name, // Deprecation notice: toolType will be replaced by toolName
          element,
          measurementData,
        };

        triggerEvent(element, eventType, eventData);
      } else {
        removeToolState(element, tool.name, measurementData);
      }
    }
  );
}
