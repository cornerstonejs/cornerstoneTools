import { getters, state } from '../store';
import getActiveToolsForElement from '../store/getActiveToolsForElement';
import filterToolsUseableWithMultiPartTools from '../store/filterToolsUsableWithMultiPartTools';

// Todo: We could simplify this if we only allow one active
// Tool per mouse button mask?
export default function getActiveTool(
  element,
  buttons,
  interactionType = 'mouse'
) {
  let tools;

  if (interactionType === 'touch') {
    tools = getActiveToolsForElement(element, getters.touchTools());
    tools = tools.filter(tool => tool.options.isTouchActive);
  } else {
    // Filter out disabled, enabled, and passive
    tools = getActiveToolsForElement(element, getters.mouseTools());

    // Filter out tools that do not match mouseButtonMask
    tools = tools.filter(
      tool =>
        Array.isArray(tool.options.mouseButtonMask) &&
        buttons &&
        tool.options.mouseButtonMask.includes(buttons) &&
        tool.options.isMouseActive
    );

    if (state.isMultiPartToolActive) {
      tools = filterToolsUseableWithMultiPartTools(tools);
    }
  }

  if (tools.length === 0) {
    return;
  }

  return tools[0];
}
