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
  constructor(props = {}) {
    const defaultProps = {
      name: 'StackScrollMouseWheel',
      supportedInteractionTypes: ['MouseWheel'],
      configuration: {
        loop: false,
        allowSkipping: true,
        invert: false,
      },
    };

    super(props, defaultProps);
  }

  mouseWheelCallback(evt) {
    const { direction: images, element } = evt.detail;
    const { loop, allowSkipping, invert } = this.configuration;
    const direction = invert ? -images : images;

    scroll(element, direction, loop, allowSkipping);
  }
}
