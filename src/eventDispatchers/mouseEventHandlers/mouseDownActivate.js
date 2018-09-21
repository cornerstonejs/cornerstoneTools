import addNewMeasurement from './addNewMeasurement.js';
import { getters, state } from './../../store/index.js';
import getActiveToolsForElement from './../../store/getActiveToolsForElement.js';
import BaseAnnotationTool from '../../base/BaseAnnotationTool.js';

// Todo: We could simplify this if we only allow one active
// Tool per mouse button mask?
export default function (evt) {
  if (state.isToolLocked) {
    return;
  }

  const eventData = evt.detail;
  const element = eventData.element;

  // Filter out disabled, enabled, and passive
  let tools = getActiveToolsForElement(element, getters.mouseTools());

  // Filter out tools that do not match mouseButtonMask
  tools = tools.filter(
    (tool) => eventData.buttons === tool.options.mouseButtonMask
  );

  if (tools.length === 0) {
    return;
  }

  const activeTool = tools[0];

  // Note: custom `addNewMeasurement` will need to prevent event bubbling
  if (activeTool.addNewMeasurement) {
    activeTool.addNewMeasurement(evt, 'mouse');
  } else if (activeTool instanceof BaseAnnotationTool) {
    addNewMeasurement(evt, activeTool);
  }
}
