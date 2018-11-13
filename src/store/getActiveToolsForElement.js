/**
 * Filters an array of tools, returning only tools which are active.
 * @export
 * @public
 * @method
 * @name getActiveToolsForElement
 *
 * @param  {HTMLElement} element The element.
 * @param  {Object[]} tools      The input tool array.
 * @param  {string} handlerType  The input type being queried.
 * @returns {Object[]}            The filtered array.
 */
export default function(element, tools, handlerType) {
  return tools.filter(
    tool =>
      tool.element === element &&
      tool.mode === 'active' &&
      (handlerType === undefined || tool.options[`is${handlerType}Active`])
  );
}
