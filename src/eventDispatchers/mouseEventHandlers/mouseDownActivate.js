import addNewMeasurement from './addNewMeasurement.js';
import { state } from './../../store/index.js';
import BaseAnnotationTool from './../../tools/base/BaseAnnotationTool.js';
import getActiveTool from '../../util/getActiveTool';

export default function(evt) {
  if (state.isToolLocked) {
    return;
  }

  const eventData = evt.detail;
  const element = eventData.element;

  const activeTool = getActiveTool(eventData);

  if (typeof activeTool.preMouseDownActivateCallback === 'function') {
    const consumedEvent = activeTool.preMouseDownActivateCallback(evt);

    if (consumedEvent) {
      return;
    }
  }

  if (state.isMultiPartToolActive) {
    return;
  }

  // Note: custom `addNewMeasurement` will need to prevent event bubbling
  if (activeTool.addNewMeasurement) {
    activeTool.addNewMeasurement(evt, 'mouse');
  } else if (activeTool instanceof BaseAnnotationTool) {
    addNewMeasurement(evt, activeTool);
  }
}
