/* eslint class-methods-use-this: 0 */ // --> OFF
import external from '../externalModules.js';
import BaseTool from '../base/BaseTool.js';

/**
 * @export @public @class
 * @name DoubleTapFitToWindowTool
 * @classdesc Tool which calls the external cornerstone.fitToWindow() function
 * on double tap.
 * @extends BaseTool
 */
export default class DoubleTapFitToWindowTool extends BaseTool {
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
