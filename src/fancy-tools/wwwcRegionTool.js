/* eslint no-loop-func: 0 */ // --> OFF
/* eslint no-underscore-dangle: 0 */
import external from './../externalModules.js';
import baseTool from './../base/baseTool.js';
import EVENTS from './../events.js';
// Drawing
import { draw, drawRect, getNewContext } from '../util/drawing.js';
import clip from '../util/clip.js';
import getLuminance from '../util/getLuminance.js';
import toolColors from './../stateManagement/toolColors.js';

export default class extends baseTool {
  constructor (name) {
    super({
      name: name || 'wwwcRegion',
      supportedInteractionTypes: ['mouse', 'touch'],
      configuration: {
        minWindowWidth: 10
      }
    });

    this._mouseUpCallback = this._mouseUpCallback.bind(this);
    this._mouseMoveCallback = this._mouseMoveCallback.bind(this);

    this._resetHandles();
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

  mouseDragCallback (evt) {
    this._setHandlesAndUpdate(evt);
  }

  touchDragCallback (evt) {
    // Prevent CornerstoneToolsTouchStartActive from killing any press events
    // Evt.stopImmediatePropagation();
    this._setHandlesAndUpdate(evt);
  }

  activeMouseDownCallback (evt) {
    const eventData = evt.detail;

    if (isEmptyObject(this.handles.start)) {
      this.handles.start = eventData.currentPoints.image;
      this._activateModify(eventData.element);
    } else {
      this.handles.end = eventData.currentPoints.image;
    }
  }

  /**
   * Event handler for MOUSE_MOVE during handles selection
   *
   * @param  {} evt
   */
  _mouseMoveCallback (evt) {
    this._setHandlesAndUpdate(evt);
  }

  /**
   * This function will update the handles and updateImage to force re-draw
   *
   * @param  {} evt
   */
  _setHandlesAndUpdate (evt) {
    const eventData = evt.detail;
    const element = eventData.element;

    this.handles.end = eventData.currentPoints.image;

    external.cornerstone.updateImage(element);
  }

  /**
   * Event handler for MOUSE_UP during handle drag event loop.
   *
   * @param {Object} evt - The event.
   */
  _mouseUpCallback (evt) {
    if (isEmptyObject(this.handles.start) || isEmptyObject(this.handles.end)) {
      return;
    }

    const eventData = evt.detail;
    const element = eventData.element;

    eventData.handles = this.handles;
    applyWWWCRegion(evt, this.configuration);
    this._resetHandles();
    this._deactivateModify(element);
  }

  _resetHandles () {
    this.handles = {
      start: {},
      end: {}
    };
  }

  /**
   * Adds modify loop event listeners.
   *
   * @private
   * @param {Object} element - The viewport element to add event listeners to.
   * @modifies {element}
   */
  _activateModify (element) {
    element.addEventListener(EVENTS.MOUSE_UP, this._mouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_CLICK, this._mouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_MOVE, this._mouseMoveCallback);
  }

  /**
   * Removes modify loop event listeners.
   *
   * @private
   * @param {Object} element - The viewport element to add event listeners to.
   * @modifies {element}
   */
  _deactivateModify (element) {
    element.removeEventListener(EVENTS.MOUSE_UP, this._mouseUpCallback);
    element.removeEventListener(EVENTS.MOUSE_CLICK, this._mouseUpCallback);
    element.removeEventListener(EVENTS.MOUSE_MOVE, this._mouseMoveCallback);
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
