import BaseAnnotationTool from '../tools/base/BaseAnnotationTool.js';
import BaseBrushTool from '../tools/base/BaseBrushTool.js';

/**
 * Filters an array of tools, returning only tools which are active or passive.
 * @export
 * @public
 * @method
 * @name filterToolsUseableWithMultiPartTools
 *
 * @param  {Object[]} tools      The input tool array.
 * @returns {Object[]}            The filtered array.
 */
export default function(tools) {
  return tools.filter(
    tool =>
      !tool.isMultiPartTool &&
      !(tool instanceof BaseAnnotationTool) &&
      !(tool instanceof BaseBrushTool)
  );
}
