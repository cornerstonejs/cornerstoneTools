import { state } from './index.js';

/**
 * Returns the tool instance attached to the element.
 * @export
 * @public
 * @method
 * @name getToolForElement
 *
 * @param  {HTMLElement} element The element.
 * @param  {string}      name The tool's name.
 * @returns {Object}      The tool instance.
 */
export default function(element, name) {
  return state.tools.find(
    tool => tool.element === element && tool.name === name
  );
}
