import EVENTS from './../events.js';
import external from './../externalModules.js';
import baseBrushTool from './../base/baseBrushTool.js';
import toolColors from './../stateManagement/toolColors.js';
// Utils
import getCircle from './shared/brushUtils/getCircle.js';
import { drawBrushPixels } from './shared/brushUtils/drawBrush.js';
import KeyboardController from './shared/KeyboardController.js';
// State
import { getToolState, addToolState } from './../stateManagement/toolState.js';
import { getters } from './../store/index.js';

export default class extends baseBrushTool {
  constructor (name = 'brushEraser') {
    super({
      name,
      supportedInteractionTypes: ['mouse'],
      configuration: defaultBrushConfiguration()
    });

    const keyBinds = this.configuration.keyBinds;

    this._mouseUpCallback = this._mouseUpCallback.bind(this);
    this._keyboardController = new KeyboardController(this, keyBinds);
  }

  /**
  * Event handler for MOUSE_DRAG event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  mouseDragCallback (evt) {
    const eventData = evt.detail;
    const element = eventData.element;

    this._paint(eventData);
    this._activateDrag(element);
    this._lastImageCoords = eventData.currentPoints.image;
  }

  /**
  * Event handler for MOUSE_DRAG event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  mouseDownCallback (evt) {
    const eventData = evt.detail;
    const element = eventData.element;

    this._paint(eventData);
    this._activateDrag(element);
    this._lastImageCoords = eventData.currentPoints.image;
  }

  _mouseUpCallback(evt) {
    const eventData = evt.detail;
    const element = eventData.element;

    this._deactivateDrag(element);
  }


  /**
  * Called by the event dispatcher to render the image.
  *
  * @param {Object} evt - The event.
  */
  renderBrush (evt) {
    // Render the brush
    const eventData = evt.detail;
    const configuration = this._configuration;

    let mousePosition;

    if (configuration.dragging) {
      mousePosition = this._lastImageCoords;
    } else {
      mousePosition = getters.mousePositionImage();
    }

    if (!mousePosition) {
      return;
    }

    const { rows, columns } = eventData.image;
    const { x, y } = mousePosition;

    if (x < 0 || x > columns ||
      y < 0 || y > rows) {
      return;
    }

    // Draw the hover overlay on top of the pixel data

    const radius = configuration.radius;
    const context = eventData.canvasContext;
    const color = this._dragging ? configuration.dragColor : configuration.hoverColor;
    const element = eventData.element;

    context.setTransform(1, 0, 0, 1, 0, 0);

    const { cornerstone } = external;
    const mouseCoordsCanvas = cornerstone.pixelToCanvas(element, mousePosition);
    const canvasTopLeft = cornerstone.pixelToCanvas(element, {
      x: 0,
      y: 0
    });
    const radiusCanvas = cornerstone.pixelToCanvas(element, {
      x: radius,
      y: 0
    });
    const circleRadius = Math.abs(radiusCanvas.x - canvasTopLeft.x);

    context.beginPath();
    context.strokeStyle = color;
    context.ellipse(mouseCoordsCanvas.x, mouseCoordsCanvas.y, circleRadius, circleRadius, 0, 0, 2 * Math.PI);
    context.stroke();
  }

  _paint (eventData) {
    const configuration = this.configuration;
    const element = eventData.element;
    const { rows, columns } = eventData.image;
    const { x, y } = eventData.currentPoints.image;
    let toolData = getToolState(element, this._referencedToolData);

    let pixelData;

    if (toolData) {
      pixelData = toolData.data[0].pixelData;
    } else {
      pixelData = new Uint8ClampedArray(eventData.image.width * eventData.image.height);
      addToolState(element, this._referencedToolData, { pixelData });
      toolData = getToolState(element, this._referencedToolData);
    }

    const brushPixelValue = configuration.draw;
    const radius = configuration.radius;

    if (x < 0 || x > columns ||
      y < 0 || y > rows) {
      return;
    }

    const pointerArray = getCircle(radius, rows, columns, x, y);

    drawBrushPixels(pointerArray, pixelData, brushPixelValue, columns);

    toolData.data[0].invalidated = true;

    external.cornerstone.updateImage(eventData.element);
  }

  _activateDrag (element) {
    element.removeEventListener(EVENTS.MOUSE_UP, this._mouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_UP, this._mouseUpCallback);

    this.configuration.dragging = true;
  }

  _deactivateDrag (element) {
    element.removeEventListener(EVENTS.MOUSE_UP, this._mouseUpCallback);

    this.configuration.dragging = false;
  }

}

function defaultBrushConfiguration () {
  return {
    draw: 0,
    radius: 10,
    minRadius: 1,
    maxRadius: 50,
    brushAlpha: 0.0,
    hoverColor: toolColors.getToolColor(),
    dragColor: toolColors.getActiveColor(),
    dragging: false,
    keyBinds: {
      increaseBrushSize: '+',
      decreaseBrushSize: '-'
    }
  };
}
