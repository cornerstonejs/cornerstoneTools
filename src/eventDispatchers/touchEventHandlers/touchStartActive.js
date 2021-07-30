// State
import { state } from './../../store/index.js';
import addNewMeasurement from './addNewMeasurement.js';
import BaseAnnotationTool from './../../tools/base/BaseAnnotationTool.js';
import getActiveTool from '../../util/getActiveTool';

export default function(evt) {
  if (state.isToolLocked || state.isMultiPartToolActive) {
    return;
  }

  const element = evt.detail.element;
  const activeTool = getActiveTool(element, null, 'touch');

  // Note: custom `addNewMeasurement` will need to prevent event bubbling
  if (activeTool && activeTool.addNewMeasurement) {
    activeTool.addNewMeasurement(evt, 'touch');
  } else if (activeTool instanceof BaseAnnotationTool) {
    addNewMeasurement(evt, activeTool);
  }
}
