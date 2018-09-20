import external from '../../externalModules.js';
// State
import { getters, state } from '../../store/index.js';
// Todo: Where should these live?
import getActiveToolsForElement from '../../store/getInteractiveToolsForElement.js';

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

  // Grab all tools that could possibly have a keyboard interface. This could be
  // a mouse tool with a keyboard component or a pure keyboard tool.
  tools = getActiveToolsForElement(element, state.tools);
  // Filter out tools that actually do have a keyDown component.
  tools = tools.filter((tool) => typeof tool.onKeyDown === 'function');

  if (tools.length === 0) {
    return;
  }

  // Process all key down handlers.
  for (let i = 0; i < tools.length; i++) {
    tools[i].onKeyDown(evt);
  }
}
