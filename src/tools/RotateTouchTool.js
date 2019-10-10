import external from './../externalModules.js';
import BaseTool from './base/BaseTool.js';

/**
 * @public
 * @class RotateTouchTool
 * @memberof Tools
 *
 * @classdesc Tool for rotating the image using touch.
 * @extends Tools.Base.BaseTool
 */
export default class RotateTouchTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'RotateTouch',
      supportedInteractionTypes: ['TouchRotate'],
    };

    super(props, defaultProps);
  }

  touchRotateCallback(evt) {
    const eventData = evt.detail;
    const { element, viewport, rotation } = eventData;

    viewport.rotation += rotation;
    external.cornerstone.setViewport(element, viewport);
  }
}
