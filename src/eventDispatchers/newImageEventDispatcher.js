import { state } from './../store/index.js';
import external from './../externalModules.js';

const onNewImage = function(evt) {
  if (state.isToolLocked) {
    return false;
  }

  const element = evt.detail.element;

  const tools = state.tools.filter(
    tool =>
      tool.element === element &&
      (tool.mode === 'active' ||
        tool.mode === 'passive' ||
        tool.mode === 'enabled')
  );

  if (tools.length === 0) {
    return false;
  }

  tools.forEach(tool => {
    if (tool.newImageCallback) {
      tool.newImageCallback(evt);
    }
  });
};

const enable = function(element) {
  element.addEventListener(external.cornerstone.EVENTS.NEW_IMAGE, onNewImage);
};

const disable = function(element) {
  element.removeEventListener(
    external.cornerstone.EVENTS.NEW_IMAGE,
    onNewImage
  );
};

export default {
  enable,
  disable,
};
