import EVENTS from './../events.js';
import { state } from './../store/index.js';
import BaseBrushTool from '../base/BaseBrushTool.js';
import onNewImageBrushEventHandler from '../eventListeners/onNewImageBrushEventHandler.js';

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

  // Check if any brush tools are present.
  const brushTools = tools.filter(
    (tool) => tool instanceof BaseBrushTool
  );

  if (brushTools.length > 0) {
    onNewImageBrushEventHandler(evt);
  }
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
