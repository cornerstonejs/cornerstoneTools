import BaseTool from './base/BaseTool.js';
import scroll from '../util/scroll.js';
import { getToolState } from '../stateManagement/toolState.js';
import { setToolOptions, getToolOptions } from '../toolOptions.js';

/**
 * @public
 * @class StackScrollMultiTouchTool
 * @memberof Tools
 *
 * @classdesc Tool for scrolling through a series using multi-touch.
 * @extends Tools.Base.BaseTool
 */
export default class StackScrollMultiTouchTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'StackScrollMultiTouch',
      supportedInteractionTypes: ['MultiTouch'],
      configuration: {
        loop: false,
        allowSkipping: true,
        touchPointers: 3,
      },
    };

    super(props, defaultProps);
    this.multiTouchDragCallback = this._dragCallback.bind(this);
  }

  _dragCallback(evt) {
    const eventData = evt.detail;

    if (eventData.numPointers === this.configuration.touchPointers) {
      const { element, deltaPoints } = eventData;
      const { loop, allowSkipping } = this.configuration;
      const options = getToolOptions(this.name, element);

      const pixelsPerImage = this._getPixelPerImage(element);
      const deltaY = this._getDeltaY(element, deltaPoints.page.y);

      if (!pixelsPerImage) {
        return;
      }

      if (Math.abs(deltaY) >= pixelsPerImage) {
        const imageIdIndexOffset = Math.round(deltaY / pixelsPerImage);

        scroll(element, imageIdIndexOffset, loop, allowSkipping);

        options.deltaY = deltaY % pixelsPerImage;
      } else {
        options.deltaY = deltaY;
      }

      setToolOptions(this.name, element, options);
    }
  }

  _getDeltaY(element, deltaPointsY) {
    const options = getToolOptions(this.name, element);
    const deltaY = options.deltaY || 0;

    return deltaY + deltaPointsY;
  }

  _getPixelPerImage(element) {
    const toolData = getToolState(element, 'stack');

    if (!toolData || !toolData.data || !toolData.data.length) {
      return;
    }

    const stackData = toolData.data[0];
    const { stackScrollSpeed } = this.configuration;

    // The Math.max here makes it easier to mouseDrag-scroll small or really large image stacks
    return (
      stackScrollSpeed ||
      Math.max(2, element.offsetHeight / Math.max(stackData.imageIds.length, 8))
    );
  }
}
