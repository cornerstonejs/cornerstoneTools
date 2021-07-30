import external from '../externalModules.js';
import BaseTool from './base/BaseTool.js';
// Drawing
import { draw, drawRect, getNewContext } from '../drawing/index.js';
import clip from '../util/clip.js';
import getLuminance from '../util/getLuminance.js';
import toolColors from '../stateManagement/toolColors.js';
import { wwwcRegionCursor } from './cursors/index.js';

/**
 * @public
 * @class WwwcRegionTool
 * @memberof Tools
 *
 * @classdesc Tool for setting wwwc based on a rectangular region.
 * @extends Tools.Base.BaseTool
 */
export default class WwwcRegionTool extends BaseTool {
  /** @inheritdoc */
  constructor(props = {}) {
    const defaultProps = {
      name: 'WwwcRegion',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        minWindowWidth: 10,
      },
      svgCursor: wwwcRegionCursor,
    };

    super(props, defaultProps);
    this._resetHandles();

    //
    // Touch
    //

    /** @inheritdoc */
    this.postTouchStartCallback = this._startOutliningRegion.bind(this);

    /** @inheritdoc */
    this.touchDragCallback = this._setHandlesAndUpdate.bind(this);

    /** @inheritdoc */
    this.touchEndCallback = this._applyStrategy.bind(this);

    //
    // MOUSE
    //

    /** @inheritdoc */
    this.postMouseDownCallback = this._startOutliningRegion.bind(this);

    /** @inheritdoc */
    this.mouseClickCallback = this._startOutliningRegion.bind(this);

    /** @inheritdoc */
    this.mouseDragCallback = this._setHandlesAndUpdate.bind(this);

    /** @inheritdoc */
    this.mouseMoveCallback = this._setHandlesAndUpdate.bind(this);

    /** @inheritdoc */
    this.mouseUpCallback = this._applyStrategy.bind(this);
  }

  /**
   * Render hook: draws the WWWCRegion's "box" when selecting
   *
   * @param {Cornerstone.event#cornerstoneimagerendered} evt cornerstoneimagerendered event
   * @memberof Tools.WwwcRegionTool
   * @returns {void}
   */
  renderToolData(evt) {
    const eventData = evt.detail;
    const { element } = eventData;
    const color = toolColors.getColorIfActive({ active: true });
    const context = getNewContext(eventData.canvasContext.canvas);

    draw(context, context => {
      drawRect(context, element, this.handles.start, this.handles.end, {
        color,
      });
    });
  }

  /**
   * Sets the start handle point and claims the eventDispatcher event
   *
   * @private
   * @param {*} evt // mousedown, touchstart, click
   * @returns {Boolean} True
   */
  _startOutliningRegion(evt) {
    const consumeEvent = true;
    const element = evt.detail.element;
    const image = evt.detail.currentPoints.image;

    if (_isEmptyObject(this.handles.start)) {
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
   * @private
   * @method _setHandlesAndUpdate
   * @param {(CornerstoneTools.event#TOUCH_DRAG|CornerstoneTools.event#MOUSE_DRAG|CornerstoneTools.event#MOUSE_MOVE)} evt  Interaction event emitted by an enabledElement
   * @returns {void}
   */
  _setHandlesAndUpdate(evt) {
    const element = evt.detail.element;
    const image = evt.detail.currentPoints.image;

    this.handles.end = image;
    external.cornerstone.updateImage(element);
  }

  /**
   * Event handler for MOUSE_UP/TOUCH_END during handle drag event loop.
   *
   * @private
   * @method _applyStrategy
   * @param {(CornerstoneTools.event#MOUSE_UP|CornerstoneTools.event#TOUCH_END)} evt Interaction event emitted by an enabledElement
   * @returns {void}
   */
  _applyStrategy(evt) {
    if (
      _isEmptyObject(this.handles.start) ||
      _isEmptyObject(this.handles.end)
    ) {
      return;
    }

    evt.detail.handles = this.handles;
    _applyWWWCRegion(evt, this.configuration);
    this._resetHandles();
  }

  /**
   * Sets the start and end handle points to empty objects
   *
   * @private
   * @method _resetHandles
   * @returns {undefined}
   */
  _resetHandles() {
    this.handles = {
      start: {},
      end: {},
    };
  }
}

/**
 * Helper to determine if an object has no keys and is the correct type (is empty)
 *
 * @private
 * @function _isEmptyObject
 * @param {Object} obj The object to check
 * @returns {Boolean} true if the object is empty
 */
const _isEmptyObject = obj =>
  Object.keys(obj).length === 0 && obj.constructor === Object;

/**
 * Calculates the minimum and maximum value in the given pixel array
 * and updates the viewport of the element in the event.
 *
 * @private
 * @method _applyWWWCRegion
 * @param {(CornerstoneTools.event#MOUSE_UP|CornerstoneTools.event#TOUCH_END)} evt Interaction event emitted by an enabledElement
 * @param {Object} config The tool's configuration object
 * @returns {void}
 */
const _applyWWWCRegion = function(evt, config) {
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
  const minMaxMean = _calculateMinMaxMean(
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

  // Unset any existing VOI LUT
  viewport.voiLUT = undefined;

  external.cornerstone.setViewport(element, viewport);
  external.cornerstone.updateImage(element);
};

/**
 * Calculates the minimum, maximum, and mean value in the given pixel array
 *
 * @private
 * @method _calculateMinMaxMean
 * @param {number[]} pixelLuminance array of pixel luminance values
 * @param {number} globalMin starting "min" valie
 * @param {bumber} globalMax starting "max" value
 * @returns {Object} {min: number, max: number, mean: number }
 */
const _calculateMinMaxMean = function(pixelLuminance, globalMin, globalMax) {
  const numPixels = pixelLuminance.length;
  let min = globalMax;
  let max = globalMin;
  let sum = 0;

  if (numPixels < 2) {
    return {
      min,
      max,
      mean: (globalMin + globalMax) / 2,
    };
  }

  for (let index = 0; index < numPixels; index++) {
    const spv = pixelLuminance[index];

    min = Math.min(min, spv);
    max = Math.max(max, spv);
    sum += spv;
  }

  return {
    min,
    max,
    mean: sum / numPixels,
  };
};
