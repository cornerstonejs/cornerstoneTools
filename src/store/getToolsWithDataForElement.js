import { getToolState } from './../stateManagement/toolState.js';

export default function (element, tools) {
  return tools.filter((tool) => {
    const toolState = getToolState(element, tool.name);

    return toolState && toolState.data.length > 0;
  });
}
