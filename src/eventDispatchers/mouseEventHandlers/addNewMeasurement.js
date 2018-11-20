import external from '../../externalModules.js';
import { addToolState } from '../../stateManagement/toolState.js';
import { moveHandle, moveNewHandle } from '../../manipulators/index.js';

export default function(evt, tool) {
  //
  evt.preventDefault();
  evt.stopPropagation();
  const eventData = evt.detail;
  const element = eventData.element;
  const measurementData = tool.createNewMeasurement(eventData);

  if (!measurementData) {
    return;
  }

  // Associate this data with this imageId so we can render it and manipulate it
  addToolState(element, tool.name, measurementData);

  external.cornerstone.updateImage(element);

  const handleMover =
    Object.keys(measurementData.handles).length === 1
      ? moveHandle
      : moveNewHandle;

  handleMover(
    eventData,
    tool.name,
    measurementData,
    measurementData.handles.end,
    tool.options,
    'mouse'
  );
}
