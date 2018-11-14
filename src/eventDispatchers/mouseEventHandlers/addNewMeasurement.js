import external from '../../externalModules.js';
import { state } from '../../store/index.js';
import { addToolState } from '../../stateManagement/toolState.js';
import { moveHandle } from '../../manipulators/index.js';
import moveNewHandle from '../../manipulators/moveNewHandle.js';

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

  state.isToolLocked = true;
  external.cornerstone.updateImage(element);

  const handleMover =
    Object.keys(measurementData.handles).length === 1
      ? moveHandle
      : moveNewHandle;

  let preventHandleOutsideImage;

  if (tool.options && tool.options.preventHandleOutsideImage !== undefined) {
    preventHandleOutsideImage = tool.options.preventHandleOutsideImage;
  } else {
    preventHandleOutsideImage = false;
  }

  handleMover(
    eventData,
    tool.name,
    measurementData,
    measurementData.handles.end,
    preventHandleOutsideImage
  );
}
