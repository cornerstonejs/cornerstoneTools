import getToolForElement from './getToolForElement.js';
import { state } from './index.js';

/**
 * Sets the options of a tool on a specific element.
 * @export
 * @public
 * @method
 * @name setToolOptionsForElement
 *
 * @param {HTMLElement} element The element.
 * @param {string} toolName The name of the tool.
 * @param {Object} options The options to set.
 * @returns {void}
 */
const setToolOptionsForElement = function(element, toolName, options) {
  const tool = getToolForElement(element, toolName);

  if (tool) {
    tool.mergeOptions(options);
  }
};

/**
 * Sets the options of a tool for all elements.
 * @export
 * @public
 * @method
 * @name setToolOptions
 *
 * @param {string} toolName
 * @param {Object} options
 * @returns {void}
 */
const setToolOptions = function(toolName, options) {
  state.enabledElements.forEach(element => {
    setToolOptionsForElement(element, toolName, options);
  });
};

export { setToolOptions, setToolOptionsForElement };
