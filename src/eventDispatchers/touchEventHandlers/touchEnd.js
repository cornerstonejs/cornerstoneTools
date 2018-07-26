// Active: dragTool only
// Or tool has `touchEndCallback` method
import { getters } from './../../store/index.js';
import getActiveToolsForElement from './../../store/getActiveToolsForElement.js';

export default function (evt) {
  let tools;
  const element = evt.detail.element;

  tools = getActiveToolsForElement(element, getters.touchTools());
  tools = tools.filter((tool) => typeof tool.touchEndCallback === 'function');

  if (tools.length === 0) {
    return;
  }

  tools[0].touchEndCallback(evt);
}
