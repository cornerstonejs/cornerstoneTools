import EVENTS from './../events.js';
import external from './../externalModules.js';
import BaseBrushTool from './../base/BaseBrushTool.js';
import toolColors from './../stateManagement/toolColors.js';
// Utils
import getCircle from './shared/brushUtils/getCircle.js';
import { drawBrushPixels } from './shared/brushUtils/drawBrush.js';
import isToolActive from '../tools/shared/isToolActive.js';
import KeyboardController from './shared/KeyboardController.js';
// State
import { getToolState, addToolState } from './../stateManagement/toolState.js';
import store from '../store/index.js';

const brushState = store.modules.brush;
const cornerstone = external.cornerstone;

export default class BrushTool extends BaseBrushTool {
  constructor (name = 'Brush') {
    super({
      name,
      supportedInteractionTypes: ['mouse'],
      configuration: defaultBrushToolConfiguration()
    });

    this._newImage = false;
    this._changeDrawColor(brushState.getters.draw());
  }

  /**
   * Used to redraw the tool's annotation data per render.
   *
   * @override
   * @param {Object} evt - The event.
   * @returns
   */
  renderToolData (evt) {
    const eventData = evt.detail;

    const element = eventData.element;
    let toolData = getToolState(element, this.referencedToolData);
    let pixelData;

    if (toolData) {
      pixelData = toolData.data[0].pixelData;
    } else {
      pixelData = new Uint8ClampedArray(eventData.image.width * eventData.image.height);
      addToolState(element, this.referencedToolData, { pixelData });
      toolData = getToolState(element, this.referencedToolData);
    }

    // Draw previous image, unless this is a new image, then don't!
    if (this._imageBitmap && !this._newImage) {
      this._drawImageBitmap(evt);
    }

    if (this._newImage) {
      this._newImage = false;
    }

    if (isToolActive(element, this.name)) {
      // Call the hover event for the brush
      this.renderBrush(evt);
    }

    if (!toolData.data[0].invalidated) {
      return;
    }

    const colormapId = brushState.getters.colorMapId();
    const colormap = cornerstone.colors.getColormap(colormapId);
    const colorLut = colormap.createLookupTable();

    const imageData = new ImageData(eventData.image.width, eventData.image.height);
    const image = {
      stats: {},
      minPixelValue: 0,
      getPixelData: () => pixelData
    };

    cornerstone.storedPixelDataToCanvasImageDataColorLUT(image, colorLut.Table, imageData.data);

    window.createImageBitmap(imageData).then((newImageBitmap) => {
      this._imageBitmap = newImageBitmap;
      toolData.data[0].invalidated = false;

      external.cornerstone.updateImage(eventData.element);
    });
  }


  /**
  * Called by the event dispatcher to render the image.
  *
  * @param {Object} evt - The event.
  */
  renderBrush (evt) {
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
    const radius = brushState.getters.radius();
    const context = eventData.canvasContext;
    const color = this._drawing ? configuration.dragColor : configuration.hoverColor;
    const element = eventData.element;

    context.setTransform(1, 0, 0, 1, 0, 0);

    const { cornerstone } = external;
    const mouseCoordsCanvas = cornerstone.pixelToCanvas(element, this._lastImageCoords);
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


  /**
   * Paints the data to the canvas.
   *
   * @private
   * @param  {Object} eventData The data object associated with the event.
   */
  _paint (eventData) {
    const configuration = this.configuration;
    const element = eventData.element;
    const { rows, columns } = eventData.image;
    const { x, y } = eventData.currentPoints.image;
    let toolData = getToolState(element, this.referencedToolData);

    let pixelData;

    if (toolData) {
      pixelData = toolData.data[0].pixelData;
    } else {
      pixelData = new Uint8ClampedArray(eventData.image.width * eventData.image.height);
      addToolState(element, this.referencedToolData, { pixelData });
      toolData = getToolState(element, this.referencedToolData);
    }

    const brushPixelValue = brushState.getters.draw();
    const radius = brushState.getters.radius();

    if (x < 0 || x > columns ||
      y < 0 || y > rows) {
      return;
    }

    const pointerArray = getCircle(radius, rows, columns, x, y);

    drawBrushPixels(pointerArray, pixelData, brushPixelValue, columns);

    toolData.data[0].invalidated = true;

    external.cornerstone.updateImage(eventData.element);
  }

  /**
  * Event handler for NEW_IMAGE event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  newImageCallback (evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    let toolData = getToolState(element, this.referencedToolData);

    if (!toolData) {
      const pixelData = new Uint8ClampedArray(eventData.image.width * eventData.image.height);

      addToolState(element, this.referencedToolData, { pixelData });
      toolData = getToolState(element, this.referencedToolData);
    }

    toolData.data[0].invalidated = true;
    this._newImage = true;

    external.cornerstone.updateImage(eventData.element);
  }
}

function defaultBrushToolConfiguration () {
  return {
    hoverColor: toolColors.getToolColor(),
    dragColor: toolColors.getActiveColor(),
    keyBinds: {
      increaseBrushSize: '+',
      decreaseBrushSize: '-',
      nextSegmentation: '[',
      previousSegmentation: ']'
    }
  };
}


/* Safari and Edge polyfill for createImageBitmap
 * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/createImageBitmap
 */

if (!('createImageBitmap' in window)) {
 window.createImageBitmap = async function (imageData) {
   return new Promise((resolve) => {
     const img = document.createElement('img');

     img.addEventListener('load', function () {

       resolve(this);
     });

     const conversionCanvas = document.createElement('canvas');

     conversionCanvas.width = imageData.width;
     conversionCanvas.height = imageData.height;

     const conversionCanvasContext = conversionCanvas.getContext('2d');

     conversionCanvasContext.putImageData(imageData, 0, 0, 0, 0, conversionCanvas.width, conversionCanvas.height);
     img.src = conversionCanvas.toDataURL();
   });
 };
}
