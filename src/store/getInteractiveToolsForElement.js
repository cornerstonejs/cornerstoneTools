/**
 * Filters an array of tools, returning only tools which are active or passive.
 * @export
 * @public
 * @method
 * @name getInteractiveToolsForElement
 *
 * @param  {HTMLElement} element The element.
 * @param  {Object[]} tools      The input tool array.
 * @returns {Object[]}            The filtered array.
 */
export default function(element, tools) {
  return tools.filter(
    tool =>
      tool.element === element &&
      (tool.mode === 'active' || tool.mode === 'passive')
  );
}
