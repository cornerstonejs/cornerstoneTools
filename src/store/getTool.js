import { state } from 'index.js';

export default function (element, toolName) {
  return state.tools.find(
    (tool) => tool.element === element && tool.toolName === toolName
  );
}
