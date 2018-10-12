import { state } from './index.js';
import getToolForElement from './getToolForElement.js';

/**
 *
 *
 * @export
 * @param {*} element
 * @param {baseTool} tool
 */
const addToolForElement = function (element, apiTool) {
  // Instantiating the tool here makes it harder to accidentally add
  // The same tool (by reference) for multiple elements (which would reassign the tool
  // To a new element).
  const tool = new apiTool();

  const toolAlreadyAddedToElement = getToolForElement(element, tool.toolName);

  if (toolAlreadyAddedToElement) {
    console.warn(
      `${tool.toolName} has already been added to the target element`
    );

    return;
  }

  tool.element = element;
  state.tools.push(tool);
};

/**
 *
 *
 * @export
 * @param {baseTool} tool
 */
const addTool = function (apiTool) {
  state.enabledElements.forEach((element) => {
    addToolForElement(element, apiTool);
  });
};

export { addTool, addToolForElement };
