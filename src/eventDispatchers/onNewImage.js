import { state } from './../store/index.js';
import getActiveToolsForElement from './../store/getActiveToolsForElement.js';

export default function (evt) {
  if (state.isToolLocked) {
    return false;
  }

  const element = evt.detail.element;

  const tools = state.tools.filter(
    (tool) =>
      tool.element === element &&
      (tool.mode === 'active' ||
        tool.mode === 'passive' ||
        tool.mode === 'enabled')
  );

  tools.forEach((tool) => {
    if (tool.newImageCallback) {
      tool.newImageCallback(evt);
    }
  });
}
