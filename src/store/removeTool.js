import { state } from './index.js';

/**
 * Removes all tools from the target element with the provided name
 * @export @public @method
 * @name removeToolForElement
 *
 * @param {HTMLElement} element The element.
 * @param {string} toolName The name of the tool.
 */
const removeToolForElement = function (element, toolName) {
  const toolIndex = state.tools.findIndex(
    (tool) => tool.element === element && tool.name === toolName
  );

  if (toolIndex >= 0) {
    state.tools.splice(toolIndex, 1);
  }
};

/**
 * Removes all tools from all enabled elements with the provided name.
 * @export @public @method
 * @name removeTool
 *
 * @param {string} toolName The name of the tool.
 */
const removeTool = function (toolName) {
  state.enabledElements.forEach((element) => {
    removeToolForElement(element, toolName);
  });
};

export { removeTool, removeToolForElement };
