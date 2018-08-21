/* eslint class-methods-use-this: 0 */ // --> OFF
import external from '../externalModules.js';
import baseTool from '../base/baseTool.js';

export default class extends baseTool {
  constructor (name = 'doubleTapZoom') {
    super({
      name,
      supportedInteractionTypes: ['touch']
    });
  }

  doubleTapCallback (evt) {
    const eventData = evt.detail;

    external.cornerstone.fitToWindow(eventData.element);
  }
}
