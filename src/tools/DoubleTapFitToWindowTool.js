import external from '../externalModules.js';
import BaseTool from './base/BaseTool.js';

/**
 * @public
 * @class DoubleTapFitToWindowTool
 * @memberof Tools
 *
 * @classdesc Tool which calls the external cornerstone.fitToWindow() function
 * on double tap.
 * @extends Tools.Base.BaseTool
 */
export default class DoubleTapFitToWindowTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'DoubleTapFitToWindow',
      supportedInteractionTypes: ['DoubleTap'],
    };

    super(props, defaultProps);
  }

  doubleTapCallback(evt) {
    const eventData = evt.detail;

    external.cornerstone.fitToWindow(eventData.element);
  }
}
