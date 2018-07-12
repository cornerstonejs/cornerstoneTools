import { state } from './index.js';

export default function (element, name) {
  return state.tools.find(
    (tool) => tool.element === element && tool.name === name
  );
}
