import BaseTool from './base/BaseTool.js';
import scroll from '../util/scroll.js';

/**
 * @public
 * @class StackScrollMouseWheelTool
 * @memberof Tools
 *
 * @classdesc Tool for scrolling through a series using the mouse wheel.
 * @extends Tools.Base.BaseTool
 */
export default class StackScrollMouseWheelTool extends BaseTool {
  constructor(configuration = {}) {
    const defaultConfig = {
      name: 'StackScrollMouseWheel',
      supportedInteractionTypes: ['MouseWheel'],
      configuration: {
        loop: false,
        allowSkipping: true,
        invert: false,
      },
    };
    const initialConfiguration = Object.assign(defaultConfig, configuration);

    super(initialConfiguration);

    this.initialConfiguration = initialConfiguration;
  }

  mouseWheelCallback(evt) {
    const { direction: images, element } = evt.detail;
    const { loop, allowSkipping, invert } = this.configuration;
    const direction = invert ? -images : images;

    scroll(element, direction, loop, allowSkipping);
  }
}
