import external from './../../externalModules.js';
// State
import { getters, state } from './../../store/index.js';
// Todo: Where should these live?
import getInteractiveToolsForElement from './../../store/getInteractiveToolsForElement.js';

const cornerstone = external.cornerstone;

/**
 * KeyDown is used for keyboard input for mouse tools.
 *
 *
 * @param {Object} evt
 */
export default function (evt) {
  if (state.isToolLocked) {
    return;
  }

  let tools;
  const element = evt.detail.element;

  // Filter out tools that don't have a mouse interface.
  tools = getInteractiveToolsForElement(element, getters.mouseTools());
  tools = tools.filter((tool) => typeof tool.onKeyDown === 'function');

  if (tools.length === 0) {
    return;
  }

  for (let i = 0; i < tools.length; i++) {
    tools[i].onKeyDown(evt);
  }
}
