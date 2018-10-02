/* eslint class-methods-use-this: 0 */ // --> OFF
import external from '../externalModules.js';
import baseTool from '../base/BaseTool.js';

export default class extends baseTool {
  constructor (name = 'DoubleTapFitToWindow') {
    super({
      name,
      supportedInteractionTypes: ['DoubleTap']
    });
  }

  doubleTapCallback (evt) {
    const eventData = evt.detail;

    external.cornerstone.fitToWindow(eventData.element);
  }
}
