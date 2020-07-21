import EVENTS from '../../events.js';
import external from '../../externalModules.js';
import { state } from '../../store/index.js';
import {
  moveNewHandle,
  anyHandlesOutsideDisplayedArea,
  anyHandlesOutsideImage,
} from '../../manipulators/index.js';
import {
  addToolState,
  removeToolState,
} from '../../stateManagement/toolState.js';
import triggerEvent from '../../util/triggerEvent.js';
import { getLogger } from '../../util/logger.js';
import getDefault from '../../util/getDefault.js';

const logger = getLogger('eventDispatchers:touchEventHandlers');

export default function(evt, tool) {
  logger.log('addNewMeasurement');

  evt.preventDefault();
  evt.stopPropagation();

  const touchEventData = evt.detail;
  const element = touchEventData.element;
  const measurementData = tool.createNewMeasurement(touchEventData);
  const { handles } = measurementData;

  if (!measurementData) {
    return;
  }

  addToolState(element, tool.name, measurementData);

  // Todo: Looks like we're handling the "up" of the tap?
  if (Object.keys(handles).length === 1 && touchEventData.type === EVENTS.TAP) {
    // Todo: bold assumptions about measurement data for all tools?
    measurementData.active = false;
    measurementData.invalidated = true;
    handles.end.active = false;
    handles.end.highlight = false;

    const deleteIfHandleOutsideDisplayedArea = getDefault(
      tool.options.deleteIfHandleOutsideDisplayedArea,
      state.deleteIfHandleOutsideDisplayedArea
    );
    const deleteIfHandleOutsideImage = getDefault(
      tool.options.deleteIfHandleOutsideImage,
      state.deleteIfHandleOutsideImage
    );

    if (
      (deleteIfHandleOutsideDisplayedArea &&
        anyHandlesOutsideDisplayedArea(touchEventData, handles)) ||
      (deleteIfHandleOutsideImage &&
        anyHandlesOutsideImage(touchEventData, handles))
    ) {
      // Delete the measurement
      removeToolState(element, tool.name, measurementData);
    }

    external.cornerstone.updateImage(element);

    return;
  }

  external.cornerstone.updateImage(element);

  moveNewHandle(
    touchEventData,
    tool.name,
    measurementData,
    handles.end,
    tool.options,
    'touch',
    () => {
      const eventType = EVENTS.MEASUREMENT_COMPLETED;
      const eventData = {
        toolName: tool.name,
        toolType: tool.name, // Deprecation notice: toolType will be replaced by toolName
        element,
        measurementData,
      };

      triggerEvent(element, eventType, eventData);
    }
  );
}
