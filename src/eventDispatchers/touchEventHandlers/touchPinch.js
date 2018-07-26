import { getters } from './../../store/index.js';
import getActiveToolsForElement from './../../store/getActiveToolsForElement.js';

export default function (evt) {
  console.log('touchPinch');
  if (isAwaitingTouchUp) {
    return;
  }

  let tools;
  const element = evt.detail.element;

  // Filter out disabled, enabled, and passive
  tools = getActiveToolsForElement(element, getters.touchTools());
  tools = tools.filter((tool) => typeof tool.touchPinchCallback === 'function');

  if (tools.length === 0) {
    return;
  }

  tools[0].touchPinchCallback(evt);
}
