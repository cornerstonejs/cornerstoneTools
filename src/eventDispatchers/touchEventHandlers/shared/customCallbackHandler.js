import { getters, state } from './../../../store/index.js';
import getActiveToolsForElement from './../../../store/getActiveToolsForElement.js';

export default function (customFunction, evt) {
  if (state.isToolLocked) {
    return false;
  }

  let tools;
  const element = evt.detail.element;

  tools = getActiveToolsForElement(element, getters.touchTools());
  tools = tools.filter((tool) => typeof tool[customFunction] === 'function');

  if (tools.length === 0) {
    return false;
  }

  tools[0][customFunction](evt);
}
