import { state } from './index.js';

/**
 * Removes all tools from the target element with the provided name
 *
 * @export
 * @param {*} element
 * @param {baseTool} tool
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
 * Removes all tools from all enabled elements with the provided name
 *
 * @export
 * @param {baseTool} toolName
 */
const removeTool = function (toolName) {
  state.enabledElements.forEach((element) => {
    removeToolForElement(element, toolName);
  });
};

export { removeTool, removeToolForElement };
