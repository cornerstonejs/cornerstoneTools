/* eslint no-loop-func: 0 */ // --> OFF
/* eslint no-underscore-dangle: 0 */
import external from './../externalModules.js';
import baseTool from './../base/baseTool.js';
// State
import { getToolState, addToolState } from './../stateManagement/toolState.js';
// Utils
import isToolActive from '../fancy-tools/shared/isToolActive.js';
import { getNewContext } from '../util/drawing.js';
import { initialiseBrushColormap } from '../stateManagement/brushToolColors.js';

const cornerstone = external.cornerstone;

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

/**
* @abstract
*/
export default class extends baseTool {
  constructor ({
    name,
    strategies,
    defaultStrategy,
    configuration,
    supportedInteractionTypes
  }) {
    super({
      name,
      strategies,
      defaultStrategy,
      configuration,
      supportedInteractionTypes
    });

    this.isBrushTool = true;
    this._imageBitmap;
    this._referencedToolData = 'brush';
    this._dragging = false;
    this._newImage = false;
  }

  /**
  * Event handler for NEW_IMAGE event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  onNewImageCallback (evt) {
    throw new Error(`Method onNewImageCallback not implemented for ${this.toolName}.`);
  }

  /**
  * Event handler for MOUSE_DRAG event.
  *
  * @abstract
  * @event
  * @param {Object} evt - The event.
  */
  mouseDragCallback (evt) {
    throw new Error(`Method mouseDragCallback not implemented for ${this.toolName}.`);
  }

  /**
  * Event handler for MOUSE_DRAG event.
  *
  * @abstract
  * @event
  * @param {Object} evt - The event.
  */
  mouseDownCallback (evt) {
    throw new Error(`Method mouseDownCallback not implemented for ${this.toolName}.`);
  }

  /**
  * Event handler for MOUSE_MOVE event.
  *
  * @abstract
  * @event
  * @param {Object} evt - The event.
  */
  mouseMoveCallback (evt) {
    throw new Error(`Method mouseMoveCallback not implemented for ${this.toolName}.`);
  }


  /**
   * Called by the render to renderToolData to render the overlay.
   *
   * @abstract
   * @param {Object} evt - The event.
   */
  renderBrush (evt) {
    throw new Error(`Method renderBrush not implemented for ${this.toolName}.`);
  }

  /**
   * Used to handle mouseMove events triggered by the eventDispatcher
   *
   * @param {*} evt
   * @return {boolean} whether the canvas needs to be re-rendered.
   */
  handleMouseMove (evt) {
    const eventData = evt.detail;
    const element = eventData.element;

    let imageNeedsUpdate = false;

    if (isToolActive(element, this.name)) {
      this.mouseMoveCallback(evt);
      imageNeedsUpdate = true;
    }

    return imageNeedsUpdate;
  }
  /**
  * Used to check if there is a valid target for the tool.
  *
  * @param {*} evt
  * @returns {Boolean} - True if the target is manipulatable by the tool.
  */
  isValidTarget (evt) {
    const eventData = evt.detail;
    const element = eventData.element;

    if (isToolActive(element, this.name)) {
      return true;
    }

    return false;
  }

  /**
  * Event handler for KEY_DOWN event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  onKeyDown (evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    const keyCode = eventData.keyCode;

    if (!isToolActive(element, this.name)) {
      return;
    }

    console.log(this._keyboardController);

    if (!this._keyboardController) {
      return;
    }

    const imageNeedsUpdate = this._keyboardController.keyPress(keyCode);

    console.log(imageNeedsUpdate);

    if (imageNeedsUpdate) {
      external.cornerstone.updateImage(element);
    }
  }

  /**
  * Switches to the next segmentation color.
  *
  * @virtual
  */
  nextSegmentation () {
    console.log('_nextSegmentation');
    const configuration = this.configuration;
    const numberOfColors = this._getNumberOfColors();

    let drawId = configuration.draw + 1;

    if (drawId === numberOfColors) {
      drawId = 1;
    }

    this._changeDrawColor(drawId);
  }

  /**
  * Switches to the previous segmentation color.
  *
  * @virtual
  */
  previousSegmentation () {
    console.log('_previousSegmentation');
    const configuration = this.configuration;
    const numberOfColors = this._getNumberOfColors();

    let drawId = configuration.draw - 1;

    if (drawId < 1) {
      drawId = numberOfColors - 1;
    }

    this._changeDrawColor(drawId);
  }

  /**
  * Increases the brush size
  *
  * @virtual
  */
  increaseBrushSize () {
    console.log('_increaseBrushSize');
    const configuration = this.configuration;

    const oldRadius = configuration.radius;
    let newRadius = Math.floor(oldRadius * 1.2);

    // If e.g. only 2 pixels big. Math.floor(2*1.2) = 2.
    // Hence, have minimum increment of 1 pixel.
    if (newRadius === oldRadius) {
      newRadius += 1;
    }

    if (newRadius > configuration.maxRadius) {
      newRadius = configuration.maxRadius;
    }

    configuration.radius = newRadius;
  }

  /**
  * Decreases the brush size
  *
  * @virtual
  */
  decreaseBrushSize () {
    console.log('_decreaseBrushSize');
    const configuration = this.configuration;

    const oldRadius = configuration.radius;
    let newRadius = Math.floor(oldRadius * 0.8);

    if (newRadius < configuration.minRadius) {
      newRadius = configuration.minRadius;
    }

    configuration.radius = newRadius;
  }

  /**
   *
   *
   * @param {*} evt
   * @returns
   */
  renderToolData (evt) {
    const eventData = evt.detail;
    const configuration = this.configuration;

    const element = eventData.element;
    let toolData = getToolState(element, this._referencedToolData);
    let pixelData;

    if (toolData) {
      pixelData = toolData.data[0].pixelData;
    } else {
      pixelData = new Uint8ClampedArray(eventData.image.width * eventData.image.height);
      addToolState(element, this._referencedToolData, { pixelData });

      toolData = getToolState(element, this._referencedToolData);
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

    const colormapId = configuration.colormapId;
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

  activeCallback (element) {

    const configuration = this.configuration;
    let colormapId = configuration.colormapId;

    if (!colormapId) {
      colormapId = 'BrushColorMap';

      initialiseBrushColormap(colormapId);
      configuration.colormapId = colormapId;
      this._changeDrawColor(configuration.draw);
    }
  }

  _drawImageBitmap (e) {
    const configuration = this.configuration;
    const eventData = e.detail;
    const context = getNewContext(eventData.canvasContext.canvas);

    const canvasTopLeft = external.cornerstone.pixelToCanvas(eventData.element, { x: 0, y: 0 });
    const canvasBottomRight = external.cornerstone.pixelToCanvas(eventData.element, { x: eventData.image.width, y: eventData.image.height });
    const canvasWidth = canvasBottomRight.x - canvasTopLeft.x;
    const canvasHeight = canvasBottomRight.y - canvasTopLeft.y;

    context.imageSmoothingEnabled = false;
    context.globalAlpha = configuration.brushAlpha;
    context.drawImage(this._imageBitmap, canvasTopLeft.x, canvasTopLeft.y, canvasWidth, canvasHeight);
    context.globalAlpha = 1.0;
  }

  _changeDrawColor (drawId) {
    const configuration = this._configuration;
    const colormap = external.cornerstone.colors.getColormap(configuration.colormapId);

    configuration.draw = drawId;
    const colorArray = colormap.getColor(configuration.draw);

    configuration.hoverColor = `rgba(${colorArray[[0]]}, ${colorArray[[1]]}, ${colorArray[[2]]}, 0.8 )`;
    configuration.dragColor = `rgba(${colorArray[[0]]}, ${colorArray[[1]]}, ${colorArray[[2]]}, 1.0 )`;
  }

  _getNumberOfColors () {
    const configuration = this.configuration;
    const colormap = external.cornerstone.colors.getColormap(configuration.colormapId);

    return colormap.getNumberOfColors();
  }
}
