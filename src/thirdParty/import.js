import BaseTool from '../base/BaseTool.js';
import BaseAnnotationTool from '../base/BaseAnnotationTool.js';
import BaseBrushTool from '../base/BaseBrushTool.js';
import store from '../store/index.js';

/**
 * anonymous function - description
 *
 * @param  {string} item the import path for the entity to import.
 * @return {Class|Object}
 */
export default function (item) {
  return list[item];
}

const list = {
  'base/BaseTool': BaseTool,
  'base/BaseAnnotationTool': BaseAnnotationTool,
  'base/BaseBrushTool': BaseBrushTool,
  'store': store
};
