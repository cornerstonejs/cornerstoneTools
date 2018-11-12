import external from './../externalModules.js';
import BaseTool from './base/BaseTool.js';

/**
 * @public
 * @class RotateTouchTool
 * @memberof Tools
 *
 * @classdesc Tool for rotating the image using touch.
 * @extends BaseTool
 */
export default class RotateTouchTool extends BaseTool {
  constructor(configuration = {}) {
    const defaultConfig = {
      name: 'RotateTouch',
      supportedInteractionTypes: ['TouchRotate'],
    };
    const initialConfiguration = Object.assign(defaultConfig, configuration);

    super(initialConfiguration);

    this.initialConfiguration = initialConfiguration;
  }

  touchRotateCallback(evt) {
    const eventData = evt.detail;
    const { element, viewport, rotation } = eventData;

    viewport.rotation += rotation;
    external.cornerstone.setViewport(element, viewport);
  }
}
