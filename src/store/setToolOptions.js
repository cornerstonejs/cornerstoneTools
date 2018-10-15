import { state } from './index.js';
import getToolForElement from './getToolForElement.js';

/**
 * Sets the options of a tool on a specific element.
 * @export @public @method
 * @name setToolOptionsForElement
 *
 * @param {HTMLElement} element The element.
 * @param {string} toolName The name of the tool.
 * @param {Object} options The options to set.
 */
const setToolOptionsForElement = function (element, toolName, options) {
  const tool = getToolForElement(element, toolName);

  if (tool) {
    tool.mergeOptions(options);
  }
};

/**
 * Sets the options of a tool for all elements.
 * @export @public @method
 * @name setToolOptions
 *
 * @param {string} toolName
 * @param {Object} options
 */
const setToolOptions = function (toolName, options) {
  state.enabledElements.forEach((element) => {
    setToolOptionsForElement(element, options);
  });
};

export { setToolOptions, setToolOptionsForElement };
