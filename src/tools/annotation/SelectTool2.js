import EVENTS from './../../events.js';
import external from './../../externalModules.js';
import BaseAnnotationTool from './../base/BaseAnnotationTool.js';
// State
import {
  addToolState,
  getToolState,
  removeToolState,
} from './../../stateManagement/toolState.js';
import toolStyle from './../../stateManagement/toolStyle.js';
import toolColors from './../../stateManagement/toolColors.js';
import { state } from '../../store/index.js';
import triggerEvent from '../../util/triggerEvent.js';

// Drawing
import { getNewContext, draw, drawArea } from '../../drawing/index.js';
import { clipToBox } from '../../util/clip.js';
import { hideToolCursor, setToolCursor } from '../../store/setToolCursor.js';
import { freehandMouseCursor } from '../cursors/index.js';
import freehandUtils from '../../util/freehand/index.js';
import { getLogger } from '../../util/logger.js';
const logger = getLogger('tools:annotation:SelectTool');

const {
  freehandIntersect,
  FreehandHandleData,
} = freehandUtils;

/**
 * @public
 * @class SelectTool
 * @memberof Tools.Annotation
 * @classdesc Tool for drawing arbitrary polygonal regions of interest, and
 * measuring the statistics of the enclosed pixels.
 * @extends Tools.Base.BaseAnnotationTool
 */
export default class SelectTool extends BaseAnnotationTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'Select',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: defaultFreehandConfiguration(),
      svgCursor: freehandMouseCursor,
    };

    super(props, defaultProps);

    this.isMultiPartTool = true;

    this._drawing = false;
    this._dragging = false;
    this._modifying = false;

    // Create bound callback functions for private event loops
    this._drawingMouseDownCallback = this._drawingMouseDownCallback.bind(this);
    this._drawingMouseMoveCallback = this._drawingMouseMoveCallback.bind(this);
    this._drawingMouseDragCallback = this._drawingMouseDragCallback.bind(this);
    this._drawingMouseUpCallback = this._drawingMouseUpCallback.bind(this);

    this._drawingTouchStartCallback = this._drawingTouchStartCallback.bind(
      this
    );
    this._drawingTouchDragCallback = this._drawingTouchDragCallback.bind(this);
  }

  createNewMeasurement(eventData) {
    const goodEventData =
      eventData && eventData.currentPoints && eventData.currentPoints.image;

    if (!goodEventData) {
      logger.error(
        `required eventData not supplied to tool ${
          this.name
        }'s createNewMeasurement`
      );

      return;
    }

    const measurementData = {
      visible: true,
      active: true,
      invalidated: true,
      color: undefined,
      handles: {
        points: [],
      },
    };

    return measurementData;
  }

  /**
   *
   *
   * @param {*} element
   * @param {*} data
   * @param {*} coords
   * @returns {Boolean}
   */
  pointNearTool(element, data, coords) {
    const validParameters = data && data.handles && data.handles.points;

    if (!validParameters) {
      throw new Error(
        `invalid parameters supplied to tool ${this.name}'s pointNearTool`
      );
    }

    if (!validParameters || data.visible === false) {
      return false;
    }
    return false;
  }

  /**
   *
   *
   * @param {*} evt
   * @returns {undefined}
   */
  renderToolData(evt) {
    const eventData = evt.detail;

    // If we have no toolState for this element, return immediately as there is nothing to do
    const toolState = getToolState(evt.currentTarget, this.name);

    if (!toolState) {
      return;
    }

    const { image, element } = eventData;
    const config = this.configuration;
    const seriesModule = external.cornerstone.metaData.get(
      'generalSeriesModule',
      image.imageId
    );
    
    const modality = seriesModule ? seriesModule.modality : null;

    // We have tool adta for this element - iterate over each one and draw it
    const context = getNewContext(eventData.canvasContext.canvas);
    const lineWidth = toolStyle.getToolWidth();

    for (let i = 0; i < toolState.data.length; i++) {
      const data = toolState.data[i];

      if (data.visible === false) {
        continue;
      }

      draw(context, context => {
        let color = toolColors.getColorIfActive(data);
        let fillColor;

        if (data.active) {
          if (data.handles.invalidHandlePlacement) {
            color = config.invalidColor;
          } else {
            color = toolColors.getColorIfActive(data);
          }
        } else {
          fillColor = config.fillColor;
        }

        if (data.handles.points.length) {
          for (let j = 0; j < data.handles.points.length; j++) {
            const lines = [...data.handles.points[j].lines];
            const points = data.handles.points;

            if (j === points.length - 1 && !data.polyBoundingBox) {
              // If it's still being actively drawn, keep the last line to
              // The mouse location
              lines.push(config.mouseLocation.handles.start);
            }
            drawArea(
              context,
              eventData.element,
              data.handles.points[0],
              data.handles.points,
              { color, fillColor }
            );
          }
        }
      });
    }
  }

  mouseMoveCallback(evt) { 

  }
  handleSelectedCallback(evt) {
    
  }

  addNewMeasurement(evt) {
    const eventData = evt.detail;

    this._startDrawing(evt);
    this._addPoint(eventData);

    preventPropagation(evt);
  }

  /**
   * Event handler for MOUSE_MOVE during drawing event loop.
   *
   * @event
   * @param {Object} evt - The event.
   * @returns {undefined}
   */
  _drawingMouseMoveCallback(evt) {
    const eventData = evt.detail;

    // Set the mouseLocation handle
    this._getMouseLocation(eventData);

    // Force onImageRendered
    external.cornerstone.updateImage(eventData.element);
  }

  /**
   * Event handler for MOUSE_DRAG during drawing event loop.
   *
   * @event
   * @param {Object} evt - The event.
   * @returns {undefined}
   */
  _drawingMouseDragCallback(evt) {
    if (!this.options.mouseButtonMask.includes(evt.detail.buttons)) {
      return;
    }

    this._drawingDrag(evt);
  }

  /**
   * Event handler for TOUCH_DRAG during drawing event loop.
   *
   * @event
   * @param {Object} evt - The event.
   * @returns {undefined}
   */
  _drawingTouchDragCallback(evt) {
    this._drawingDrag(evt);
  }

  _drawingDrag(evt) {
    const eventData = evt.detail;
    // Set the mouseLocation handle
    this._getMouseLocation(eventData);
    this._addPoint(eventData);
    this._dragging = true;

    // Force onImageRendered
    external.cornerstone.updateImage(eventData.element);
  }

  /**
   * Event handler for MOUSE_UP during drawing event loop.
   *
   * @event
   * @param {Object} evt - The event.
   * @returns {undefined}
   */
  _drawingMouseUpCallback(evt) {
    const eventData = evt.detail;

    if (!this._dragging) {
      return;
    }

    this._dragging = false;

    const element = eventData.element;

    const config = this.configuration;

    const lastHandlePlaced = config.currentHandle;
    this._endDrawing(element, lastHandlePlaced);

    preventPropagation(evt);

    return;
  }

  /**
   * Event handler for MOUSE_DOWN during drawing event loop.
   *
   * @event
   * @param {Object} evt - The event.
   * @returns {undefined}
   */
  _drawingMouseDownCallback(evt) {
    const eventData = evt.detail;

    if (!this.options.mouseButtonMask.includes(eventData.buttons)) {
      return;
    }

    this._addPoint(eventData);

    preventPropagation(evt);

    return;
  }

  /**
   * Event handler for TOUCH_START during drawing event loop.
   *
   * @event
   * @param {Object} evt - The event.
   * @returns {undefined}
   */
  _drawingTouchStartCallback(evt) {
    const eventData = evt.detail;

    this._addPoint(eventData);

    preventPropagation(evt);

    return;
  }

  /** Ends the active drawing loop and completes the polygon.
   *
   * @public
   * @param {Object} element - The element on which the roi is being drawn.
   * @returns {null}
   */
  completeDrawing(element) {
    if (!this._drawing) {
      return;
    }
    const toolState = getToolState(element, this.name);
    const config = this.configuration;
    const data = toolState.data[config.currentTool];

    if (
      !freehandIntersect.end(data.handles.points) &&
      data.handles.points.length >= 2
    ) {
      const lastHandlePlaced = config.currentHandle;

      data.polyBoundingBox = {};
      this._endDrawing(element, lastHandlePlaced);
    }
  }

  /**
   * Begining of drawing loop when tool is active and a click event happens far
   * from existing handles.
   *
   * @private
   * @param {Object} evt - The event.
   * @returns {undefined}
   */
  _startDrawing(evt) {
    const eventData = evt.detail;
    const measurementData = this.createNewMeasurement(eventData);
    const element = eventData.element;
    const config = this.configuration;

    this._referencedElement = element;

    let interactionType;

    if (evt.type === EVENTS.MOUSE_DOWN_ACTIVATE) {
      interactionType = 'Mouse';
    } else if (evt.type === EVENTS.TOUCH_START_ACTIVE) {
      interactionType = 'Touch';
    }
    this._activateDraw(element, interactionType);
    this._getMouseLocation(eventData);

    addToolState(eventData.element, this.name, measurementData);

    const toolState = getToolState(eventData.element, this.name);

    config.currentTool = toolState.data.length - 1;

    this._activeDrawingToolReference = toolState.data[config.currentTool];
  }

  /**
   * Adds a point on mouse click in polygon mode.
   *
   * @private
   * @param {Object} eventData - data object associated with an event.
   * @returns {undefined}
   */
  _addPoint(eventData) {
    const toolState = getToolState(eventData.element, this.name);

    // Get the toolState from the last-drawn polygon
    const config = this.configuration;
    const data = toolState.data[config.currentTool];

    const newHandleData = new FreehandHandleData(eventData.currentPoints.image);

    // If this is not the first handle
    if (data.handles.points.length) {
      // Add the line from the current handle to the new handle
      data.handles.points[config.currentHandle - 1].lines.push(
        eventData.currentPoints.image
      );
    }

    // Add the new handle
    data.handles.points.push(newHandleData);

    // Increment the current handle value
    config.currentHandle += 1;

    // Force onImageRendered to fire
    external.cornerstone.updateImage(eventData.element);
    this.fireModifiedEvent(eventData.element, data);
  }

  /**
   * Ends the active drawing loop and completes the polygon.
   *
   * @private
   * @param {Object} element - The element on which the roi is being drawn.
   * @param {Object} handleNearby - the handle nearest to the mouse cursor.
   * @returns {undefined}
   */
  _endDrawing(element, handleNearby) {
    const toolState = getToolState(element, this.name);
    const config = this.configuration;
    const data = toolState.data[config.currentTool];

    data.active = false;
    data.highlight = false;
    data.handles.invalidHandlePlacement = false;

    // Connect the end handle to the origin handle
    if (handleNearby !== undefined) {
      const points = data.handles.points;

      points[config.currentHandle - 1].lines.push(points[0]);
    }

    if (this._modifying) {
      this._modifying = false;
      data.invalidated = true;
    }

    // Reset the current handle
    config.currentHandle = 0;
    config.currentTool = -1;
    data.canComplete = false;

    if (this._drawing) {
      this._deactivateDraw(element);
    }

    external.cornerstone.updateImage(element);

    this.fireModifiedEvent(element, data);
    this.fireCompletedEvent(element, data);
  }

  /**
   * Gets the current mouse location and stores it in the configuration object.
   *
   * @private
   * @param {Object} eventData The data assoicated with the event.
   * @returns {undefined}
   */
  _getMouseLocation(eventData) {
    // Set the mouseLocation handle
    const config = this.configuration;

    config.mouseLocation.handles.start.x = eventData.currentPoints.image.x;
    config.mouseLocation.handles.start.y = eventData.currentPoints.image.y;
    clipToBox(config.mouseLocation.handles.start, eventData.image);
  }

  /**
   * Adds drawing loop event listeners.
   *
   * @private
   * @param {Object} element - The viewport element to add event listeners to.
   * @param {string} interactionType - The interactionType used for the loop.
   * @modifies {element}
   * @returns {undefined}
   */
  _activateDraw(element, interactionType = 'Mouse') {
    this._drawing = true;
    this._drawingInteractionType = interactionType;

    state.isMultiPartToolActive = true;
    hideToolCursor(this.element);

    // Polygonal Mode
    element.addEventListener(EVENTS.MOUSE_DOWN, this._drawingMouseDownCallback);
    element.addEventListener(EVENTS.MOUSE_MOVE, this._drawingMouseMoveCallback);

    // Drag/Pencil Mode
    element.addEventListener(EVENTS.MOUSE_DRAG, this._drawingMouseDragCallback);
    element.addEventListener(EVENTS.MOUSE_UP, this._drawingMouseUpCallback);

    // Touch
    element.addEventListener(
      EVENTS.TOUCH_START,
      this._drawingMouseMoveCallback
    );
    element.addEventListener(
      EVENTS.TOUCH_START,
      this._drawingTouchStartCallback
    );

    element.addEventListener(EVENTS.TOUCH_DRAG, this._drawingTouchDragCallback);
    element.addEventListener(EVENTS.TOUCH_END, this._drawingMouseUpCallback);

    external.cornerstone.updateImage(element);
  }

  /**
   * Removes drawing loop event listeners.
   *
   * @private
   * @param {Object} element - The viewport element to add event listeners to.
   * @modifies {element}
   * @returns {undefined}
   */
  _deactivateDraw(element) {
    this._drawing = false;
    state.isMultiPartToolActive = false;
    this._activeDrawingToolReference = null;
    this._drawingInteractionType = null;
    setToolCursor(this.element, this.svgCursor);

    element.removeEventListener(
      EVENTS.MOUSE_DOWN,
      this._drawingMouseDownCallback
    );
    element.removeEventListener(
      EVENTS.MOUSE_MOVE,
      this._drawingMouseMoveCallback
    );
    element.removeEventListener(
      EVENTS.MOUSE_DRAG,
      this._drawingMouseDragCallback
    );
    element.removeEventListener(EVENTS.MOUSE_UP, this._drawingMouseUpCallback);

    // Touch
    element.removeEventListener(
      EVENTS.TOUCH_START,
      this._drawingTouchStartCallback
    );
    element.removeEventListener(
      EVENTS.TOUCH_DRAG,
      this._drawingTouchDragCallback
    );
    element.removeEventListener(
      EVENTS.TOUCH_START,
      this._drawingMouseMoveCallback
    );
    element.removeEventListener(EVENTS.TOUCH_END, this._drawingMouseUpCallback);

    external.cornerstone.updateImage(element);
  }

  passiveCallback(element) {
    this._closeToolIfDrawing(element);
  }

  enabledCallback(element) {
    this._closeToolIfDrawing(element);
  }

  disabledCallback(element) {
    this._closeToolIfDrawing(element);
  }

  _closeToolIfDrawing(element) {
    if (this._drawing) {
      // Actively drawing but changed mode.
      const config = this.configuration;
      const lastHandlePlaced = config.currentHandle;

      this._endDrawing(element, lastHandlePlaced);
      external.cornerstone.updateImage(element);
    }
  }

  /**
   * Fire MEASUREMENT_MODIFIED event on provided element
   * @param {any} element which freehand data has been modified
   * @param {any} measurementData the measurment data
   * @returns {void}
   */
  fireModifiedEvent(element, measurementData) {
    const eventType = EVENTS.MEASUREMENT_MODIFIED;
    const eventData = {
      toolName: this.name,
      element,
      measurementData,
    };

    triggerEvent(element, eventType, eventData);
  }

  fireCompletedEvent(element, measurementData) {
    const eventType = EVENTS.MEASUREMENT_COMPLETED;
    const eventData = {
      toolName: this.name,
      element,
      measurementData,
    };

    triggerEvent(element, eventType, eventData);
  }

  // ===================================================================
  // Public Configuration API. .
  // ===================================================================

  get spacing() {
    return this.configuration.spacing;
  }

  set spacing(value) {
    if (typeof value !== 'number') {
      throw new Error(
        'Attempting to set freehand spacing to a value other than a number.'
      );
    }

    this.configuration.spacing = value;
    external.cornerstone.updateImage(this.element);
  }

  get invalidColor() {
    return this.configuration.invalidColor;
  }

  set invalidColor(value) {
    /*
      It'd be easy to check if the color was e.g. a valid rgba color. However
      it'd be difficult to check if the color was a named CSS color without
      bloating the library, so we don't. If the canvas can't intepret the color
      it'll show up grey.
    */

    this.configuration.invalidColor = value;
    external.cornerstone.updateImage(this.element);
  }

  /**
   * Ends the active drawing loop and removes the polygon.
   *
   * @public
   * @param {Object} element - The element on which the roi is being drawn.
   * @returns {null}
   */
  cancelDrawing(element) {
    if (!this._drawing) {
      return;
    }
    const toolState = getToolState(element, this.name);

    const config = this.configuration;

    const data = toolState.data[config.currentTool];

    data.active = false;
    data.highlight = false;
    data.handles.invalidHandlePlacement = false;

    // Reset the current handle
    config.currentHandle = 0;
    config.currentTool = -1;
    data.canComplete = false;

    removeToolState(element, this.name, data);

    this._deactivateDraw(element);

    external.cornerstone.updateImage(element);
  }

  /**
   * New image event handler.
   *
   * @public
   * @param  {Object} evt The event.
   * @returns {null}
   */
  newImageCallback(evt) {
    const config = this.configuration;

    if (!(this._drawing && this._activeDrawingToolReference)) {
      return;
    }

    // Actively drawing but scrolled to different image.

    const element = evt.detail.element;
    const data = this._activeDrawingToolReference;

    data.active = false;
    data.highlight = false;
    data.handles.invalidHandlePlacement = false;

    // Connect the end handle to the origin handle
    const points = data.handles.points;

    points[config.currentHandle - 1].lines.push(points[0]);

    // Reset the current handle
    config.currentHandle = 0;
    config.currentTool = -1;
    data.canComplete = false;

    this._deactivateDraw(element);

    external.cornerstone.updateImage(element);
  }
}

function defaultFreehandConfiguration() {
  return {
    mouseLocation: {
      handles: {
        start: {
          highlight: true,
          active: true,
        },
      },
    },
    spacing: 1,
    invalidColor: 'rgba(0, 255, 0, 0.8)',
    fillColor: 'rgba(230, 25, 75, 0.8 )',
    currentHandle: 0,
    currentTool: -1,
  };
}

function preventPropagation(evt) {
  evt.stopImmediatePropagation();
  evt.stopPropagation();
  evt.preventDefault();
}
