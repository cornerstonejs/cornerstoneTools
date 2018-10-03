/* eslint no-loop-func: 0 */ // --> OFF
/* eslint no-underscore-dangle: 0 */
import external from './../externalModules.js';
import BaseTool from './../base/BaseTool.js';
// Drawing
import { draw, drawRect, getNewContext } from '../util/drawing.js';
import clip from '../util/clip.js';
import getLuminance from '../util/getLuminance.js';
import toolColors from './../stateManagement/toolColors.js';

export default class wwwcRegionTool extends BaseTool {
  constructor (name = 'WwwcRegion') {
    super({
      name,
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        minWindowWidth: 10
      }
    });

    this._resetHandles();
    // Touch
    this.postTouchStartCallback = this._startOutliningRegion.bind(this);
    this.touchDragCallback = this._setHandlesAndUpdate.bind(this);
    this.touchEndCallback = this._applyStrategy.bind(this);
    // Mouse
    this.postMouseDownCallback = this._startOutliningRegion.bind(this);
    this.mouseClickCallback = this._startOutliningRegion.bind(this);
    this.mouseDragCallback = this._setHandlesAndUpdate.bind(this);
    this.mouseMoveCallback = this._setHandlesAndUpdate.bind(this);
    this.mouseUpCallback = this._applyStrategy.bind(this);
  }

  renderToolData (evt) {
    const eventData = evt.detail;
    const { element } = eventData;
    const color = toolColors.getColorIfActive({ active: true });
    const context = getNewContext(eventData.canvasContext.canvas);

    draw(context, (context) => {
      drawRect(context, element, this.handles.start, this.handles.end, {
        color
      });
    });
  }

  /**
   * Sets the start handle point and claims the eventDispatcher event
   *
   * @param {*} evt
   * @returns {Boolean} True
   */
  _startOutliningRegion (evt) {
    const consumeEvent = true;
    const element = evt.detail.element;
    const image = evt.detail.currentPoints.image;

    if (isEmptyObject(this.handles.start)) {
      this.handles.start = image;
    } else {
      this.handles.end = image;
      this._applyStrategy(evt);
    }

    external.cornerstone.updateImage(element);

    return consumeEvent;
  }

  /**
   * This function will update the handles and updateImage to force re-draw
   *
   * @param  {} evt
   */
  _setHandlesAndUpdate (evt) {
    const element = evt.detail.element;
    const image = evt.detail.currentPoints.image;

    this.handles.end = image;
    external.cornerstone.updateImage(element);
  }

  /**
   * Event handler for MOUSE_UP during handle drag event loop.
   *
   * @param {Object} evt - The event.
   */
  _applyStrategy (evt) {
    if (isEmptyObject(this.handles.start) || isEmptyObject(this.handles.end)) {
      return;
    }

    evt.detail.handles = this.handles;
    applyWWWCRegion(evt, this.configuration);
    this._resetHandles();
  }

  /**
   * Sets the start and end handle points to empty objects
   *
   */
  _resetHandles () {
    this.handles = {
      start: {},
      end: {}
    };
  }
}

/**
 *
 *
 * @param {*} obj
 */
const isEmptyObject = (obj) =>
  Object.keys(obj).length === 0 && obj.constructor === Object;

/**
 * Calculates the minimum and maximum value in the given pixel array
 *
 * @param {*} evt
 * @param {*} config
 */
const applyWWWCRegion = (evt, config) => {
  const eventData = evt.detail;
  const { image, element } = eventData;
  const { start: startPoint, end: endPoint } = evt.detail.handles;

  // Get the rectangular region defined by the handles
  let left = Math.min(startPoint.x, endPoint.x);
  let top = Math.min(startPoint.y, endPoint.y);
  let width = Math.abs(startPoint.x - endPoint.x);
  let height = Math.abs(startPoint.y - endPoint.y);

  // Bound the rectangle so we don't get undefined pixels
  left = clip(left, 0, image.width);
  top = clip(top, 0, image.height);
  width = Math.floor(Math.min(width, Math.abs(image.width - left)));
  height = Math.floor(Math.min(height, Math.abs(image.height - top)));

  // Get the pixel data in the rectangular region
  const pixelLuminanceData = getLuminance(element, left, top, width, height);

  // Calculate the minimum and maximum pixel values
  const minMaxMean = calculateMinMaxMean(
    pixelLuminanceData,
    image.minPixelValue,
    image.maxPixelValue
  );

  // Adjust the viewport window width and center based on the calculated values
  const viewport = eventData.viewport;

  if (config.minWindowWidth === undefined) {
    config.minWindowWidth = 10;
  }

  viewport.voi.windowWidth = Math.max(
    Math.abs(minMaxMean.max - minMaxMean.min),
    config.minWindowWidth
  );
  viewport.voi.windowCenter = minMaxMean.mean;

  external.cornerstone.setViewport(element, viewport);
  external.cornerstone.updateImage(element);
};

/**
 * Calculates the minimum, maximum, and mean value in the given pixel array
 *
 * @param {*} storedPixelLuminanceData
 * @param {*} globalMin
 * @param {*} globalMax
 * @returns
 */
const calculateMinMaxMean = (
  storedPixelLuminanceData,
  globalMin,
  globalMax
) => {
  const numPixels = storedPixelLuminanceData.length;
  let min = globalMax;
  let max = globalMin;
  let sum = 0;

  if (numPixels < 2) {
    return {
      min,
      max,
      mean: (globalMin + globalMax) / 2
    };
  }

  for (let index = 0; index < numPixels; index++) {
    const spv = storedPixelLuminanceData[index];

    min = Math.min(min, spv);
    max = Math.max(max, spv);
    sum += spv;
  }

  return {
    min,
    max,
    mean: sum / numPixels
  };
};
