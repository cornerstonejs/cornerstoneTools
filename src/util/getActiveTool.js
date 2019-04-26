import { getters, state } from '../store';
import getActiveToolsForElement from '../store/getActiveToolsForElement';
import filterToolsUseableWithMultiPartTools from '../store/filterToolsUsableWithMultiPartTools';

// Todo: We could simplify this if we only allow one active
// Tool per mouse button mask?
export default function getActiveTool(eventData) {
  // Filter out disabled, enabled, and passive
  let tools = getActiveToolsForElement(eventData.element, getters.mouseTools());

  // Filter out tools that do not match mouseButtonMask
  tools = tools.filter(
    tool =>
      Array.isArray(tool.options.mouseButtonMask) &&
      tool.options.mouseButtonMask.includes(eventData.buttons) &&
      tool.options.isMouseActive
  );

  if (state.isMultiPartToolActive) {
    tools = filterToolsUseableWithMultiPartTools(tools);
  }

  if (tools.length === 0) {
    return;
  }

  return tools[0];
}
