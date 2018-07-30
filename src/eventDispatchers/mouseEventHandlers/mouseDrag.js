import { getters, state } from './../../store/index.js';
import isMouseButtonEnabled from './../../util/isMouseButtonEnabled.js';
import getActiveToolsForElement from './../../store/getActiveToolsForElement.js';

// Tools like wwwc. Non-annotation tools w/ specific
// Down + mouse behavior
// TODO: I don't like filtering in drag because it's such
// A high frequency event. Anything we can do to reduce
// Repeat math here would be a big help
export default function (evt) {
  if (state.isToolLocked) {
    return;
  }

  let tools;
  const eventData = evt.detail;
  const element = eventData.element;

  // Filter out disabled, enabled, and passive
  tools = getActiveToolsForElement(element, getters.mouseTools());
  tools = tools.filter((tool) =>
    isMouseButtonEnabled(eventData.which, tool.options.mouseButtonMask)
  );
  tools = tools.filter((tool) => typeof tool.mouseDragCallback === 'function');

  if (tools.length === 0) {
    return;
  }

  const activeTool = tools[0];

  activeTool.mouseDragCallback(evt);
}
