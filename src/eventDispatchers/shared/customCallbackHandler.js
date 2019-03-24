import { state } from './../../store/index.js';
import getActiveToolsForElement from './../../store/getActiveToolsForElement.js';
import filterToolsUseableWithMultiPartTools from './../../store/filterToolsUsableWithMultiPartTools.js';

export default function(handlerType, customFunction, evt) {
  if (state.isToolLocked) {
    return false;
  }

  // TODO: We sometimes see a null detail for TOUCH_PRESS
  const element = evt.detail.element;
  let tools = state.tools.filter(tool =>
    tool.supportedInteractionTypes.includes(handlerType)
  );

  // Tool is active, and specific callback is active
  tools = getActiveToolsForElement(element, tools, handlerType);

  // Tool has expected callback custom function
  tools = tools.filter(tool => typeof tool[customFunction] === 'function');

  if (state.isMultiPartToolActive) {
    tools = filterToolsUseableWithMultiPartTools(tools);
  }

  if (tools.length === 0) {
    return false;
  }

  tools[0][customFunction](evt);
}
