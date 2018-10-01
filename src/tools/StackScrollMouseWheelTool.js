/* eslint no-loop-func: 0 */ // --> OFF
/* eslint no-underscore-dangle: 0 */
import BaseTool from './../base/BaseTool.js';
import scroll from '../util/scroll.js';

export default class StackScrollMouseWheelTool extends BaseTool {
  constructor (name = 'StackScrollMouseWheel') {
    super({
      name,
      supportedInteractionTypes: ['MouseWheel'],
      configuration: {
        loop: false,
        allowSkipping: true
      }
    });
  }

  mouseWheelCallback (evt) {
    const { direction: images, element } = evt.detail;
    const { loop, allowSkipping } = this.configuration;

    scroll(element, -images, loop, allowSkipping);
  }
}
