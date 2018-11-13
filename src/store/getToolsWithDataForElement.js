import { getToolState } from './../stateManagement/toolState.js';

/**
 * Filters an array of tools, returning only tools which have annotation data.
 * @export
 * @public
 * @method
 * @name getToolsWithDataForElement
 *
 * @param  {HTMLElement} element The element.
 * @param  {Object[]} tools      The input tool array.
 * @returns {Object[]}            The filtered array.
 */
export default function(element, tools) {
  return tools.filter(tool => {
    const toolState = getToolState(element, tool.name);

    return toolState && toolState.data.length > 0;
  });
}
