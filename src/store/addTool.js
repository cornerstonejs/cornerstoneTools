import store from './index.js';
import getToolForElement from './getToolForElement.js';

/**
 * Adds a tool to an enabled element.
 *
 * @public
 * @function addToolForElement
 * @memberof CornerstoneTools
 *
 * @param {HTMLElement} element The element to add the tool to.
 * @param {BaseTool} ApiTool The tool to add to the element.
 * @param {Object} [configuration] Override the default tool configuration
 * @returns {undefined}
 */
const addToolForElement = function(element, ApiTool, configuration) {
  // Instantiating the tool here makes it harder to accidentally add
  // The same tool (by reference) for multiple elements (which would reassign the tool
  // To a new element).
  const tool = new ApiTool(configuration);
  const toolAlreadyAddedToElement = getToolForElement(element, tool.name);

  if (toolAlreadyAddedToElement) {
    console.warn(`${tool.name} has already been added to the target element`);

    return;
  }

  tool.element = element;
  store.state.tools.push(tool);
};

/**
 * Adds a tool to all enabled element.
 *
 * @public
 * @function addTool
 * @memberof CornerstoneTools
 *
 * @param {BaseTool} ApiTool The tool to add to each element.
 * @param {Object} [configuration] Override the default tool configuration
 * @returns {undefined}
 */
const addTool = function(ApiTool, configuration) {
  _addToolGlobally(ApiTool, configuration);
  store.state.enabledElements.forEach(element => {
    addToolForElement(element, ApiTool, configuration);
  });
};

/**
 * Adds tool with matching name from globally registered tools.
 * Requires `globalToolSyncEnabled` to be set to true
 *
 * @private
 * @function addToolGlobally
 *
 * @param {BaseTool} ApiTool
 * @param {Object} [configuration] Override the default tool configuration
 * @returns {undefined}
 */
const _addToolGlobally = function(ApiTool, configuration) {
  if (!store.modules.globalConfiguration.state.globalToolSyncEnabled) {
    return;
  }

  const tool = new ApiTool(configuration);
  const toolAlreadyAddedGlobally =
    store.state.globalTools[tool.name] !== undefined;

  if (toolAlreadyAddedGlobally) {
    console.warn(`${tool.name} has already been added globally`);

    return;
  }

  store.state.globalTools[tool.name] = {
    tool: ApiTool,
    configuration,
    activeBindings: [],
  };
};

export { addTool, addToolForElement };
