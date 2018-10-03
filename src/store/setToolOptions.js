import { state } from './index.js';
import getToolForElement from './getToolForElement.js';

/**
 *
 *
 * @export
 * @param {*} element
 * @param {string} toolName
 * @param {Object} options
 */
const setToolOptionsForElement = function (element, toolName, options) {
  const tool = getToolForElement(element, toolName);

  if (tool) {
    tool.mergeOptions(options);
  }
};

/**
 *
 *
 * @export
 * @param {string} toolName
 * @param {Object} options
 */
const setToolOptions = function (toolName, options) {
  state.enabledElements.forEach((element) => {
    setToolOptionsForElement(element, options);
  });
};

export { setToolOptions, setToolOptionsForElement };
