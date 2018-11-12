import external from '../externalModules.js';
import BaseTool from './base/BaseTool.js';

/**
 * @public
 * @class DoubleTapFitToWindowTool
 * @memberof Tools
 *
 * @classdesc Tool which calls the external cornerstone.fitToWindow() function
 * on double tap.
 * @extends BaseTool
 */
export default class DoubleTapFitToWindowTool extends BaseTool {
  constructor(configuration = {}) {
    const defaultConfig = {
      name: 'DoubleTapFitToWindow',
      supportedInteractionTypes: ['DoubleTap'],
    };
    const initialConfiguration = Object.assign(defaultConfig, configuration);

    super(initialConfiguration);

    this.initialConfiguration = initialConfiguration;
  }

  doubleTapCallback(evt) {
    const eventData = evt.detail;

    external.cornerstone.fitToWindow(eventData.element);
  }
}
