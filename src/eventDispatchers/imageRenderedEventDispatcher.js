import { state } from './../store/index.js';
import BaseBrushTool from './../tools/base/BaseBrushTool.js';
import onImageRenderedBrushEventHandler from '../eventListeners/onImageRenderedBrushEventHandler.js';
import external from './../externalModules.js';

const onImageRendered = function(evt) {
  const eventData = evt.detail;
  const element = eventData.element;

  // Render Annotation Tools
  const toolsToRender = state.tools.filter(
    tool =>
      tool.element === element &&
      (tool.mode === 'active' ||
        tool.mode === 'passive' ||
        tool.mode === 'enabled')
  );

  const brushTools = toolsToRender.filter(
    tool => tool instanceof BaseBrushTool
  );

  if (brushTools.length > 0) {
    onImageRenderedBrushEventHandler(evt);
  }

  toolsToRender.forEach(tool => {
    if (tool.renderToolData) {
      tool.renderToolData(evt);
    }
  });
};

const enable = function(element) {
  element.addEventListener(
    external.cornerstone.EVENTS.IMAGE_RENDERED,
    onImageRendered
  );
};

const disable = function(element) {
  element.removeEventListener(
    external.cornerstone.EVENTS.IMAGE_RENDERED,
    onImageRendered
  );
};

export default {
  enable,
  disable,
};
