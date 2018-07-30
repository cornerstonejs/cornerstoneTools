import { getters, state } from './../../store/index.js';
import getActiveToolsForElement from './../../store/getActiveToolsForElement.js';

export default function (evt) {
  if (state.isToolLocked) {
    return;
  }

  let tools;
  const element = evt.detail.element;

  // Filter out disabled, enabled, and passive
  tools = getActiveToolsForElement(element, getters.mouseTools());
  tools = tools.filter((tool) => typeof tool.mouseWheelCallback === 'function');

  if (tools.length === 0) {
    return;
  }

  tools[0].mouseWheelCallback(evt);
}
