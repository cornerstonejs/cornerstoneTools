// State
import { getters, state } from './../../store/index.js';
import getActiveToolsForElement from './../../store/getActiveToolsForElement.js';
import addNewMeasurement from './addNewMeasurement.js';
import baseAnnotationTool from '../../base/baseAnnotationTool.js';

export default function (evt) {
  if (state.isToolLocked) {
    return;
  }

  const element = evt.detail.element;
  const tools = getActiveToolsForElement(element, getters.touchTools());
  const activeTool = tools[0];

  // Note: custom `addNewMeasurement` will need to prevent event bubbling
  if (activeTool.addNewMeasurement) {
    activeTool.addNewMeasurement(evt, 'touch');
  } else if (activeTool instanceof baseAnnotationTool) {
    addNewMeasurement(evt, activeTool);
  }
}
