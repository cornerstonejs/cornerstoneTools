import BaseTool from './BaseTool.js';
import EVENTS from './../../events.js';
import external from './../../externalModules.js';
import { getToolState } from '../../stateManagement/toolState.js';
import { globalImageIdSpecificToolStateManager } from '../../stateManagement/imageIdSpecificStateManager.js';
import isToolActive from './../../store/isToolActive.js';
import { getModule } from './../../store/index.js';

const { configuration, getters, setters } = getModule('segmentation');

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
    defaultProps.mixins = ['segmentationAPI'];

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
   * Paints the data to the labelmap.
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
   * @abstract
   * @event
   * @param {Object} evt - The event.
   */
  mouseDragCallback(evt) {
    const { currentPoints } = evt.detail;

    this._lastImageCoords = currentPoints.image;

    // Safety measure incase _startPainting is overridden and doesn't always
    // start a paint.
    if (this._drawing) {
      this._paint(evt);
    }
  }

  /**
   * Event handler for MOUSE_DOWN event.
   *
   * @override
   * @abstract
   * @event
   * @param {Object} evt - The event.
   */
  preMouseDownCallback(evt) {
    const eventData = evt.detail;
    const { element, currentPoints } = eventData;

    this._startPainting(evt);

    this._lastImageCoords = currentPoints.image;
    this._drawing = true;
    this._startListeningForMouseUp(element);
    this._paint(evt);

    return true;
  }

  /**
   * Initialise painting with BaseBrushTool.
   *
   * @abstract
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
  }

  /**
   * End painting with BaseBrushTool.
   *
   * @abstract
   * @event
   * @param {Object} evt - The event.
   * @returns {void}
   */
  _endPainting(evt) {
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
  }

  // ===================================================================
  // Implementation interface
  // ===================================================================

  /**
   * Event handler for MOUSE_MOVE event.
   *
   * @override
   * @abstract
   * @event
   * @param {Object} evt - The event.
   */
  mouseMoveCallback(evt) {
    const { currentPoints } = evt.detail;

    this._lastImageCoords = currentPoints.image;
  }

  /**
   * Used to redraw the tool's cursor per render.
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

  /**
   * Event handler for switching mode to passive.
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

    this._endPainting(evt);

    this._drawing = false;
    this._mouseUpRender = true;
    this._stopListeningForMouseUp(element);
  }

  newImageCallback(evt) {
    if (this._drawing) {
      // End painting on one slice and start on another.
      this._endPainting(evt);
      this._startPainting(evt);
    }
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
  // Brush API. This is effectively a wrapper around the store.
  // ===================================================================

  /**
   * Increases the brush size
   *
   * @public
   * @api
   * @returns {void}
   */
  increaseBrushSize() {
    const oldRadius = configuration.radius;
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
    const oldRadius = configuration.radius;
    const newRadius = Math.floor(oldRadius * 0.8);

    setters.radius(newRadius);
  }

  _isCtrlDown(eventData) {
    return (eventData.event && eventData.event.ctrlKey) || eventData.ctrlKey;
  }
}

function _isSegmentationVisibleForElement(
  element,
  segmentationIndex,
  toolData
) {
  const enabledElement = external.cornerstone.getEnabledElement(element);
  const visibleSegmentationsForElement = getters.visibleSegmentationsForElement(
    enabledElement.uuid
  );

  return (
    // Global alpha for active segmentation
    state.alpha > 0.001 &&
    // Master isVisible toggle per seg + element
    // TODO: If false, should we check the secondary alpha that's applied to segmentions that aren't visible?
    visibleSegmentationsForElement[segmentationIndex] === true &&
    // Does not have alpha, or alpha is > 1 (0 to 255)
    (toolData[segmentationIndex] === undefined ||
      toolData[segmentationIndex].alpha === undefined ||
      toolData[segmentationIndex].alpha > 0.001)
  );
}

export default BaseBrushTool;
