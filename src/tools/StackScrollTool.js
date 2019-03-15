import BaseTool from './base/BaseTool.js';
import MouseCursor from '../util/MouseCursor.js';
import scroll from '../util/scroll.js';
import { getToolState } from '../stateManagement/toolState.js';
import { setToolOptions, getToolOptions } from '../toolOptions.js';

/**
 * @public
 * @class StackScrollTool
 * @memberof Tools
 *
 * @classdesc Tool for scrolling through a series.
 * @extends Tools.Base.BaseTool
 */
export default class StackScrollTool extends BaseTool {
  constructor(configuration = {}) {
    const defaultConfig = {
      name: 'StackScroll',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        loop: false,
        allowSkipping: true,
        svgCursor: stackScrollCursor,
      },
    };
    const initialConfiguration = Object.assign(defaultConfig, configuration);

    super(initialConfiguration);

    this.initialConfiguration = initialConfiguration;

    this.mouseDragCallback = this._dragCallback.bind(this);
    this.touchDragCallback = this._dragCallback.bind(this);
  }

  _dragCallback(evt) {
    const eventData = evt.detail;
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

const stackScrollCursor = new MouseCursor(
  `<svg
    data-icon="stackScroll" role="img" xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 28" width="32" height="32"
  >
    <path fill="#ffffff" d="M24 21v2c0 0.547-0.453 1-1 1h-22c-0.547 0-1-0.453-1-1v-2c0-0.547 0.453-1 1-1h22c0.547 0 1 0.453 1 1zM24 13v2c0 0.547-0.453 1-1 1h-22c-0.547 0-1-0.453-1-1v-2c0-0.547 0.453-1 1-1h22c0.547 0 1 0.453 1 1zM24 5v2c0 0.547-0.453 1-1 1h-22c-0.547 0-1-0.453-1-1v-2c0-0.547 0.453-1 1-1h22c0.547 0 1 0.453 1 1z"></path>
  </svg>`,
  'center32'
);
