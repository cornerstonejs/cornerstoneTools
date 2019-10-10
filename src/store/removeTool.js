import store, { getModule } from './index.js';

/**
 * Deactivates and removes the tool from the target element with the provided name
 *
 * @export
 * @public
 * @method
 * @name removeToolForElement
 * @param {HTMLElement} element The element.
 * @param {string} toolName The name of the tool.
 * @returns {void}
 */
const removeToolForElement = function(element, toolName) {
  const toolIndex = store.state.tools.findIndex(
    tool => tool.element === element && tool.name === toolName
  );

  if (toolIndex >= 0) {
    store.state.tools.splice(toolIndex, 1);
  }
};

/**
 * Removes all tools from all enabled elements with the provided name.
 *
 * @export
 * @public
 * @method
 * @name removeTool
 * @param {string} toolName The name of the tool.
 * @returns {void}
 */
const removeTool = function(toolName) {
  _removeToolGlobally(toolName);
  store.state.enabledElements.forEach(element => {
    removeToolForElement(element, toolName);
  });
};

/**
 * Removes tool with matching name from globally registered tools.
 * Requires `globalToolSyncEnabled` to be set to true
 *
 * @private
 * @method
 * @name removeToolGlobally
 * @param {string} toolName The name of the tool to remove.
 * @returns {void}
 */
const _removeToolGlobally = function(toolName) {
  const { configuration } = getModule('globalConfiguration');

  if (!configuration.globalToolSyncEnabled) {
    return;
  }

  if (store.state.globalTools[toolName]) {
    delete store.state.globalTools[toolName];
  }
};

export { removeTool, removeToolForElement };
