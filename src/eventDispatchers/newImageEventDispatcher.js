import EVENTS from './../events.js';
// TODO: Is this just customCallbackHandler, but for TOUCH and MOUSE?
import { state } from './../store/index.js';
import getActiveToolsForElement from './../store/getActiveToolsForElement.js';

const onNewImage = function (evt) {
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

  if (tools.length === 0) {
    return false;
  }

  tools.forEach((tool) => {
    if (tool.newImageCallback) {
      tool.newImageCallback(evt);
    }
  });
};

const enable = function (element) {
  element.addEventListener(EVENTS.NEW_IMAGE, onNewImage);
};

const disable = function (element) {
  element.removeEventListener(EVENTS.NEW_IMAGE, onNewImage);
};

export default {
  enable,
  disable
};
