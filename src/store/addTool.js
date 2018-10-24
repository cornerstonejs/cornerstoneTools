import store from './index.js';
import getToolForElement from './getToolForElement.js';

/**
 * Adds a tool to an enabled element.
 *
 * @export @public @method
 * @name addToolForElement
 * @param {HTMLElement} element The element to add the tool to.
 * @param {baseTool} tool The tool to add to the element.
 * @param {configuration} [configuration] Override the default tool configuration
 */
const addToolForElement = function (element, apiTool, configuration) {
  // Instantiating the tool here makes it harder to accidentally add
  // The same tool (by reference) for multiple elements (which would reassign the tool
  // To a new element).
  const tool = new apiTool(configuration);

  const toolAlreadyAddedToElement = getToolForElement(element, tool.name);

  if (toolAlreadyAddedToElement) {
    console.warn(`${tool.name} has already been added to the target element`);

    return;
  }

  tool.element = element;
  store.state.tools.push(tool);
};

/**
 * Adds a tool to each element.
 * @export @public @method
 * @name addTool
 * @param {baseTool} tool The tool to add to each element.
 */
const addTool = function (apiTool, configuration) {
  _addToolGlobally(apiTool, configuration);
  store.state.enabledElements.forEach((element) => {
    addToolForElement(element, apiTool);
  });
};

const _addToolGlobally = function (apiTool, configuration) {
  console.log(store.modules.globalConfiguration.state.globalToolSyncEnabled);
  if (!store.modules.globalConfiguration.state.globalToolSyncEnabled) {
    return;
  }

  const tool = new apiTool(configuration);
  const toolAlreadyAddedGlobally =
    store.state.globalTools[tool.name] !== undefined;

  if (toolAlreadyAddedGlobally) {
    console.warn(`${tool.name} has already been added globally`);

    return;
  }

  store.state.globalTools[tool.name] = {
    tool: apiTool,
    configuration
  };
};

export { addTool, addToolForElement };
