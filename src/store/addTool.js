import { state } from './index.js';
import getToolForElement from './getToolForElement.js';

/**
 * Adds a tool to an element.
 * @export @public @method
 * @name addToolForElement
 * @param {HTMLElement} element The element to add the tool to.
 * @param {baseTool} tool The tool to add to the element.
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
 * Adds a tool to each element.
 * @export @public @method
 * @name addTool
 * @param {baseTool} tool The tool to add to each element.
 */
const addTool = function (apiTool) {
  state.enabledElements.forEach((element) => {
    addToolForElement(element, apiTool);
  });
};

export { addTool, addToolForElement };
