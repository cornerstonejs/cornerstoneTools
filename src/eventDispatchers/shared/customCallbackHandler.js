import { getters, state } from './../../store/index.js';
import getActiveToolsForElement from './../../store/getActiveToolsForElement.js';

export default function (handlerType, customFunction, evt) {
  if (state.isToolLocked) {
    return false;
  }

  // TODO: We sometimes see a null detail for TOUCH_PRESS
  let tools =
    handlerType === 'touch' ? getters.touchTools() : getters.mouseTools();
  const element = evt.detail.element;

  tools = getActiveToolsForElement(element, tools);

  if (handlerType === 'touch') {
    tools = tools.filter((tool) => tool.options.isTouchActive);
  }

  tools = tools.filter((tool) => typeof tool[customFunction] === 'function');

  if (tools.length === 0) {
    return false;
  }

  tools[0][customFunction](evt);
}
