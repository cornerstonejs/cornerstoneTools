/* eslint no-loop-func: 0 */ // --> OFF
/* eslint no-underscore-dangle: 0 */
import baseTool from './../base/baseTool.js';
import scroll from '../util/scroll.js';

export default class extends baseTool {
  constructor (name = 'stackScrollMouseWheel') {
    super({
      name,
      supportedInteractionTypes: ['mouse'],
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
