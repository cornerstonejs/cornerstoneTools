import getToolForElement from './getToolForElement.js';

/**
 * Queries if a tool is active on the specified element.
 * @export
 * @public
 * @method
 * @name isToolActiveForElement
 *
 * @param  {HTMLElement} element The element being queried.
 * @param  {string} name    The name of the tool.
 * @returns {boolean}         True if the tool is active.
 */
export default function(element, name) {
  const tool = getToolForElement(element, name);

  return tool.mode === 'active';
}
