import EVENTS from './../events.js';
import { state } from './../store/index.js';

const onImageRendered = function (evt) {
  const eventData = evt.detail;
  const element = eventData.element;

  const toolsToRender = state.tools.filter(
    (tool) =>
      tool.element === element &&
      (tool.mode === 'active' ||
        tool.mode === 'passive' ||
        tool.mode === 'enabled')
  );

  toolsToRender.forEach((tool) => {
    if (tool.renderToolData) {
      tool.renderToolData(evt);
    }
  });
};

const enable = function (element) {
  element.addEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
};

const disable = function (element) {
  element.removeEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
};

export default {
  enable,
  disable
};
