import EVENTS from '../../events.js';
import external from '../../externalModules.js';
import { state } from '../../store/index.js';
import moveNewHandleTouch from '../../manipulators/moveNewHandleTouch.js';
import { addToolState } from '../../stateManagement/toolState.js';

export default function (evt, tool) {
  console.log('touch: addNewMeasurement');
  //
  evt.preventDefault();
  evt.stopPropagation();
  //
  const touchEventData = evt.detail;
  const element = touchEventData.element;
  const measurementData = tool.createNewMeasurement(touchEventData);

  if (!measurementData) {
    return;
  }

  addToolState(element, tool.name, measurementData);

  // Todo: Looks like we're handling the "up" of the tap?
  if (
    Object.keys(measurementData.handles).length === 1 &&
    touchEventData.type === EVENTS.TAP
  ) {
    // Todo: bold assumptions about measurement data for all tools?
    measurementData.active = false;
    measurementData.handles.end.active = false;
    measurementData.handles.end.highlight = false;
    measurementData.invalidated = true;

    // TODO: IFF the tool supports this feature
    // If (anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
    //   // Delete the measurement
    //   RemoveToolState(element, tool.name, measurementData);
    // }

    external.cornerstone.updateImage(element);

    return;
  }

  state.isToolLocked = true;
  external.cornerstone.updateImage(element);

  moveNewHandleTouch(
    touchEventData,
    tool.name,
    measurementData,
    measurementData.handles.end,
    function () {
      console.log('addNewMeasurement: touchUp');
      measurementData.active = false;
      measurementData.invalidated = true;
      //   If (anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
      //     // Delete the measurement
      //     RemoveToolState(element, touchToolInterface.toolType, measurementData);
      //   }

      state.isToolLocked = false;
      external.cornerstone.updateImage(element);
    }
  );
}
