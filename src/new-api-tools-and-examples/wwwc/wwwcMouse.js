import external from './../../externalModules.js';
import wwwcTool from './wwwcTool.js';

export default class extends wwwcTool {
  constructor (name) {
    super(name || 'wwwcMouse');

    this.isMouseTool = true;
  }

  mouseDragCallback (evt) {
    this.applyActiveStrategy(evt);
    external.cornerstone.setViewport(evt.detail.element, evt.detail.viewport);
  }
}
