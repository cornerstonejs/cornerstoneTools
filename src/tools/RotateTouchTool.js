/* eslint class-methods-use-this: 0 */
import external from './../externalModules.js';
import BaseTool from './../base/BaseTool.js';

/**
 * @export @public @class
 * @name RotateTouchTool
 * @classdesc Tool for rotating the image using touch.
 * @extends BaseTool
 */
export default class RotateTouchTool extends BaseTool {
  constructor (name = 'RotateTouch') {
    super({
      name,
      supportedInteractionTypes: ['TouchRotate']
    });
  }

  touchRotateCallback (evt) {
    const eventData = evt.detail;
    const { element, viewport, rotation } = eventData;

    viewport.rotation += rotation;
    external.cornerstone.setViewport(element, viewport);
  }
}
