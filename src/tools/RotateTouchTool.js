/* eslint class-methods-use-this: 0 */
import external from './../externalModules.js';
import baseTool from './../base/BaseTool.js';

export default class extends baseTool {
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
