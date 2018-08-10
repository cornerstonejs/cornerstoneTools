// TODO: Is this just customCallbackHandler, but for TOUCH and MOUSE?
import { state } from './../store/index.js';
import getActiveToolsForElement from './../store/getActiveToolsForElement.js';

export default function (evt) {
  if (state.isToolLocked) {
    return false;
  }

  let tools = state.tools;
  const element = evt.detail.element;

  tools = getActiveToolsForElement(element, tools);
  tools = tools.filter((tool) => typeof tool.newImageCallback === 'function');

  if (tools.length === 0) {
    return false;
  }

  tools[0].newImageCallback(evt);
}
