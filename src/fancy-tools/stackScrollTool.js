/* eslint no-loop-func: 0 */ // --> OFF
/* eslint no-underscore-dangle: 0 */
import baseTool from './../base/baseTool.js';
import scroll from '../util/scroll.js';
import { getToolState } from '../stateManagement/toolState.js';
import { setToolOptions, getToolOptions } from '../toolOptions.js';

export default class extends baseTool {
  constructor (name) {
    super({
      name: name || 'stackScroll',
      supportedInteractionTypes: ['mouse', 'touch'],
      configuration: {
        loop: false,
        allowSkipping: true
      }
    });

    this.mouseDragCallback = this._dragCallback.bind(this);
    this.touchDragCallback = this._dragCallback.bind(this);
  }

  mouseWheelCallback (evt) {
    const eventData = evt.detail;
    const images = -eventData.direction;
    const { loop, allowSkipping } = this.configuration;

    scroll(eventData.element, images, loop, allowSkipping);
  }

  _dragCallback (evt) {
    const eventData = evt.detail;
    const { element } = eventData;

    const toolData = getToolState(element, 'stack');

    if (!toolData || !toolData.data || !toolData.data.length) {
      return;
    }

    const stackData = toolData.data[0];
    const { allowSkipping, stackScrollSpeed } = this.configuration;

    // The Math.max here makes it easier to mouseDrag-scroll small or really large image stacks
    const pixelsPerImage = stackScrollSpeed || Math.max(2, element.offsetHeight / Math.max(stackData.imageIds.length, 8));

    const options = getToolOptions(this.name, element);
    let deltaY = options.deltaY || 0;

    deltaY += eventData.deltaPoints.page.y;

    if (Math.abs(deltaY) >= pixelsPerImage) {
      const imageIdIndexOffset = Math.round(deltaY / pixelsPerImage);

      scroll(element, imageIdIndexOffset, false, allowSkipping);

      options.deltaY = deltaY % pixelsPerImage;
    } else {
      options.deltaY = deltaY;
    }

    setToolOptions(this.name, element, options);
  }
}
