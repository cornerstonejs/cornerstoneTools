/* eslint no-underscore-dangle: 0 */
import external from './../externalModules.js';
import baseBrushTool from './../base/baseBrushTool.js';
import toolColors from './../stateManagement/toolColors.js';
// Utils
import getCircle from './shared/brushUtils/getCircle.js';
import { drawBrushPixels } from './shared/brushUtils/drawBrush.js';
import KeyboardController from './shared/KeyboardController.js';
import isToolActive from './shared/isToolActive.js';
// State
import { getToolState, addToolState } from './../stateManagement/toolState.js';

export default class extends baseBrushTool {
  constructor (name) {
    super({
      name: name || 'brushEraser',
      supportedInteractionTypes: ['mouse'],
      configuration: defaultBrushConfiguration()
    });

    const keyBinds = this.configuration.keyBinds;

    this._keyboardController = new KeyboardController(this, keyBinds);
  }

  /**
  * Event handler for MOUSE_MOVE event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  mouseMoveCallback (evt) {
    const eventData = evt.detail;

    console.log('mouseMoveCallback');

    this._dragging = false;
    this._lastImageCoords = eventData.currentPoints.image;
  }

  /**
  * Event handler for NEW_IMAGE event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  onNewImageCallback (evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    let toolData = getToolState(element, this._referencedToolData);

    if (!toolData) {
      const pixelData = new Uint8ClampedArray(eventData.image.width * eventData.image.height);

      addToolState(element, this._referencedToolData, { pixelData });
      toolData = getToolState(element, this._referencedToolData);
    }

    toolData.data[0].invalidated = true;
    this._newImage = true;

    external.cornerstone.updateImage(eventData.element);
  }

  /**
  * Event handler for MOUSE_DRAG event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  mouseDragCallback (evt) {
    const eventData = evt.detail;

    this._paint(eventData);
    this._dragging = true;
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
    console.log('mouseDownCallback');

    this._paint(eventData);
    this.configuration.dragging = true;
    this._lastImageCoords = eventData.currentPoints.image;
  }


  /**
  * Called by the event dispatcher to render the image.
  *
  * @param {Object} evt - The event.
  */
  renderBrush (evt) {
    // Render the brush
    const eventData = evt.detail;

    if (!this._lastImageCoords) {
      return;
    }

    const { rows, columns } = eventData.image;
    const { x, y } = this._lastImageCoords;

    if (x < 0 || x > columns ||
      y < 0 || y > rows) {
      return;
    }

    // Draw the hover overlay on top of the pixel data
    const configuration = this._configuration;
    const radius = configuration.radius;
    const context = eventData.canvasContext;
    const color = this._dragging ? configuration.dragColor : configuration.hoverColor;
    const element = eventData.element;

    context.setTransform(1, 0, 0, 1, 0, 0);

    const { cornerstone } = external;
    const mouseCoordsCanvas = cornerstone.pixelToCanvas(element, this._lastImageCoords);
    const canvasTopLeft = cornerstone.pixelToCanvas(element, { x: 0, y: 0 });
    const radiusCanvas = cornerstone.pixelToCanvas(element, { x: radius, y: 0 });
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
    keyBinds: {
      increaseBrushSize: '+',
      decreaseBrushSize: '-'
    }
  };
}
