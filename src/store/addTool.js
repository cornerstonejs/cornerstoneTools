import { state } from './index.js';
import getTool from './../store/getTool.js';

/**
 *
 *
 * @export
 * @param {*} element
 * @param {baseTool} tool
 */
const addTool = function (element, tool) {
  const toolAlreadyAddedToElement = getTool(element, tool.toolName);

  if (toolAlreadyAddedToElement) {
    console.warn(
      `${tool.toolName} has already been added to the target element`
    );

    return;
  }

  tool.element = element;
  state.tools.push(tool);
};

/**
 *
 *
 * @export
 * @param {baseTool} tool
 */
const addToolGlobal = function (tool) {
  state.canvases.forEach((canvas) => {
    addTool(canvas, tool);
  });
};

export { addTool, addToolGlobal };
