import external from './../../externalModules.js';
import EVENTS from './../../events.js';
import BaseTool from './BaseTool.js';
import isToolActive from './../../store/isToolActive.js';
import store from './../../store/index.js';
import { getLogger } from '../../util/logger.js';

const logger = getLogger('tools:BrushTool');

const { state, getters, setters } = store.modules.brush;

/**
 * @abstract
 * @memberof Tools.Base
 * @classdesc Abstract class for tools which manipulate the mask data to be displayed on
 * the cornerstone canvas.
 * @extends Tools.Base.BaseTool
 */
class BaseBrushTool extends BaseTool {
  constructor(props, defaultProps = {}) {
    if (!defaultProps.configuration) {
      defaultProps.configuration = { alwaysEraseOnClick: false };
    }
    defaultProps.configuration.referencedToolData = 'brush';

    super(props, defaultProps);

    this.updateOnMouseMove = true;
    this.hideDefaultCursor = true;

    this._drawing = false;
    this._drawingMouseUpCallback = this._drawingMouseUpCallback.bind(this);
  }

  // ===================================================================
  // Abstract Methods - Must be implemented.
  // ===================================================================

  /**
   * Helper function for rendering the brush.
   *
   * @abstract
   * @param {Object} evt - The event.
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  renderBrush(evt) {
    throw new Error(`Method renderBrush not implemented for ${this.name}.`);
  }

  /**
   * Paints the data to the canvas.
   *
   * @protected
   * @abstract
   * @param  {Object} evt The event.
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  _paint(evt) {
    throw new Error(`Method _paint not implemented for ${this.name}.`);
  }

  // ===================================================================
  // Virtual Methods - Have default behavior but may be overriden.
  // ===================================================================

  /**
   * Event handler for MOUSE_DRAG event.
   *
   * @override
   * @event
   * @param {Object} evt - The event.
   */
  mouseDragCallback(evt) {
    this._startPainting(evt);
  }

  /**
   * Event handler for MOUSE_DOWN event.
   *
   * @override
   * @event
   * @param {Object} evt - The event.
   */
  preMouseDownCallback(evt) {
    this._startPainting(evt);

    return true;
  }

  /**
   * Initialise painting with baseBrushTool
   *
   * @protected
   * @event
   * @param {Object} evt - The event.
   * @returns {void}
   */
  _startPainting(evt) {
    const eventData = evt.detail;
    const element = eventData.element;

    const {
      labelmap3D,
      currentImageIdIndex,
      activeLabelmapIndex,
    } = getters.getAndCacheLabelmap2D(element);

    const shouldErase =
      this._isCtrlDown(eventData) || this.configuration.alwaysEraseOnClick;

    this.paintEventData = {
      labelmap3D,
      currentImageIdIndex,
      activeLabelmapIndex,
      shouldErase,
    };

    this._paint(evt);
    this._drawing = true;
    this._startListeningForMouseUp(element);
    this._lastImageCoords = eventData.currentPoints.image;
  }

  /**
   * Event handler for MOUSE_MOVE event.
   *
   * @override
   * @event
   * @param {Object} evt - The event.
   */
  mouseMoveCallback(evt) {
    const { currentPoints } = evt.detail;

    this._lastImageCoords = currentPoints.image;
  }

  /**
   * Event handler for switching mode to passive;
   *
   * @override
   * @event
   * @param {Object} evt - The event.
   */
  // eslint-disable-next-line no-unused-vars
  passiveCallback(evt) {
    try {
      external.cornerstone.updateImage(this.element);
    } catch (error) {
      // It is possible that the image has not been loaded
      // when this is called.
      return;
    }
  }

  /**
   * Used to redraw the tool's annotation data per render.
   *
   * @override
   * @param {Object} evt - The event.
   */
  renderToolData(evt) {
    const eventData = evt.detail;
    const element = eventData.element;

    // Only brush needs to render.
    if (isToolActive(element, this.name)) {
      // Call the hover event for the brush
      this.renderBrush(evt);
    }
  }

  // ===================================================================
  // Implementation interface
  // ===================================================================

  /**
   * Event handler for MOUSE_UP during the drawing event loop.
   *
   * @protected
   * @event
   * @param {Object} evt - The event.
   * @returns {void}
   */
  _drawingMouseUpCallback(evt) {
    const eventData = evt.detail;
    const element = eventData.element;

    this._drawing = false;
    this._mouseUpRender = true;

    const {
      labelmap3D,
      currentImageIdIndex,
      activeLabelmapIndex,
      shouldErase,
    } = this.paintEventData;

    const labelmap2D = labelmap3D.labelmaps2D[currentImageIdIndex];

    // Grab the labels on the slice.
    const segmentSet = new Set(labelmap2D.pixelData);
    const iterator = segmentSet.values();

    const segmentsOnLabelmap = [];
    let done = false;

    while (!done) {
      const next = iterator.next();

      done = next.done;

      if (!done) {
        segmentsOnLabelmap.push(next.value);
      }
    }

    labelmap2D.segmentsOnLabelmap = segmentsOnLabelmap;

    // If labelmap2D now empty, delete it.
    if (
      shouldErase &&
      labelmap2D.segmentsOnLabelmap.length === 1 &&
      labelmap2D.segmentsOnLabelmap[0] === 0
    ) {
      delete labelmap3D.labelmaps2D[currentImageIdIndex];
    }

    this._stopListeningForMouseUp(element);
  }

  /**
   * Adds modify loop event listeners.
   *
   * @protected
   * @param {Object} element - The viewport element to add event listeners to.
   * @modifies {element}
   * @returns {void}
   */
  _startListeningForMouseUp(element) {
    element.removeEventListener(EVENTS.MOUSE_UP, this._drawingMouseUpCallback);
    element.removeEventListener(
      EVENTS.MOUSE_CLICK,
      this._drawingMouseUpCallback
    );

    element.addEventListener(EVENTS.MOUSE_UP, this._drawingMouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_CLICK, this._drawingMouseUpCallback);

    external.cornerstone.updateImage(element);
  }

  /**
   * Adds modify loop event listeners.
   *
   * @protected
   * @param {Object} element - The viewport element to add event listeners to.
   * @modifies {element}
   * @returns {void}
   */
  _stopListeningForMouseUp(element) {
    element.removeEventListener(EVENTS.MOUSE_UP, this._drawingMouseUpCallback);
    element.removeEventListener(
      EVENTS.MOUSE_CLICK,
      this._drawingMouseUpCallback
    );

    external.cornerstone.updateImage(element);
  }

  // ===================================================================
  // Segmentation API. This is effectively a wrapper around the store.
  // ===================================================================

  /**
   * Switches to the next segment color.
   *
   * @public
   * @api
   * @returns {void}
   */
  nextSegment() {
    setters.incrementActiveSegmentIndex(this.element);
  }

  /**
   * Switches to the previous segmentation color.
   *
   * @public
   * @api
   * @returns {void}
   */
  previousSegment() {
    setters.decrementActiveSegmentIndex(this.element);
  }

  /**
   * Increases the brush size
   *
   * @public
   * @api
   * @returns {void}
   */
  increaseBrushSize() {
    const oldRadius = state.radius;
    let newRadius = Math.floor(oldRadius * 1.2);

    // If e.g. only 2 pixels big. Math.floor(2*1.2) = 2.
    // Hence, have minimum increment of 1 pixel.
    if (newRadius === oldRadius) {
      newRadius += 1;
    }

    setters.radius(newRadius);
  }

  /**
   * Decreases the brush size
   *
   * @public
   * @api
   * @returns {void}
   */
  decreaseBrushSize() {
    const oldRadius = state.radius;
    const newRadius = Math.floor(oldRadius * 0.8);

    setters.radius(newRadius);
  }

  get alpha() {
    return state.alpha;
  }

  set alpha(value) {
    const enabledElement = this._getEnabledElement();

    state.alpha = value;
    external.cornerstone.updateImage(enabledElement.element);
  }

  get alphaOfInactiveLabelmap() {
    return state.alphaOfInactiveLabelmap;
  }

  set alphaOfInactiveLabelmap(value) {
    const enabledElement = this._getEnabledElement();

    state.alphaOfInactiveLabelmap = value;
    external.cornerstone.updateImage(enabledElement.element);
  }

  _getEnabledElement() {
    return external.cornerstone.getEnabledElement(this.element);
  }

  _isCtrlDown(eventData) {
    return (eventData.event && eventData.event.ctrlKey) || eventData.ctrlKey;
  }

  /**
   * Returns the toolData type assoicated with this type of tool.
   *
   * @static
   * @public
   * @returns {String} The number of colors in the color map.
   */
  static getReferencedToolDataName() {
    return 'brush';
  }
}

export default BaseBrushTool;
