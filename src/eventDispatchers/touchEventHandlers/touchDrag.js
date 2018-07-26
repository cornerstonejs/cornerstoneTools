import { getters } from './../../store/index.js';
import getActiveToolsForElement from './../../store/getActiveToolsForElement.js';

// TODO:
// Note: some touchDrag tools don't want to fire on touchStart
// Drag tools have an option `fireOnTouchStart` used to filter
// Them out of TOUCH_START handler
// Active: dragTool only
// Or tool has `touchDragCallback` method
export default function (evt) {
  console.log('touchDrag');

  let tools;
  const element = evt.detail.element;

  tools = getActiveToolsForElement(element, getters.touchTools());
  tools = tools.filter((tool) => typeof tool.touchDragCallback === 'function');

  if (tools.length === 0) {
    return;
  }
  const firstActiveTool = tools[0];

  firstActiveTool.touchDragCallback(evt);
}
