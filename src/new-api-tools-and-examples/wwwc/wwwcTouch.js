import external from './../../externalModules.js';
import wwwcTool from './wwwcTool.js';

export default class extends wwwcTool {
  constructor (name) {
    super(name || 'wwwcTouch');

    this.isTouchTool = true;
  }

  touchDragCallback (evt) {
    // Prevent CornerstoneToolsTouchStartActive from killing any press events
    evt.stopImmediatePropagation();
    this.applyActiveStrategy(evt);
    external.cornerstone.setViewport(evt.detail.element, evt.detail.viewport);
  }
}
