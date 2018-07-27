/* eslint no-loop-func: 0 */ // --> OFF
import external from './../externalModules.js';
import baseTool from './../base/baseTool.js';
// State
import { getToolState, addToolState } from './../stateManagement/toolState.js';

const cornerstone = external.cornerstone;

/* Safari and Edge polyfill for createImageBitmap
 * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/createImageBitmap
 */

if (!('createImageBitmap' in window)) {
  window.createImageBitmap = async function(imageData) {
    return new Promise((resolve,reject) => {
      let img = document.createElement('img');
      img.addEventListener('load', function() {

        resolve(this);
      });

      const conversionCanvas = document.createElement('canvas');

      conversionCanvas.width = imageData.width;
      conversionCanvas.height = imageData.height;

      const conversionCanvasContext = conversionCanvas.getContext('2d');

      conversionCanvasContext.putImageData(imageData, 0, 0, 0, 0, conversionCanvas.width, conversionCanvas.height);
      img.src = conversionCanvas.toDataURL();
    });
  }
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
  }


  /**
  * Event handler for MOUSE_MOVE event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  mouseMoveCallback (evt) {
    throw new Error(`Method mouseMoveCallback not implemented for ${this.toolName}.`);
  }

  /**
  * Event handler for NEW_IMAGE event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  onNewImageCallback(evt) {
    throw new Error(`Method onNewImageCallback not implemented for ${this.toolName}.`);
  }

  /**
  * Event handler for MOUSE_DRAG event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  mouseDragCallback (evt) {
    throw new Error(`Method mouseDragCallback not implemented for ${this.toolName}.`);
  }

  /**
  * Event handler for MOUSE_DRAG event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  mouseDownCallback (evt) {
    throw new Error(`Method mouseDownCallback not implemented for ${this.toolName}.`);
  }


  /**
   * renderBrush - called by the event dispatcher to render the image.
   *
   */
  renderBrush (evt) {
    throw new Error(`Method renderBrush not implemented for ${this.toolName}.`);
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
    let toolData = getToolState(element, TOOL_STATE_TOOL_TYPE);
    let pixelData;

    if (toolData) {
      pixelData = toolData.data[0].pixelData;
    } else {
      pixelData = new Uint8ClampedArray(eventData.image.width * eventData.image.height);
      addToolState(element, TOOL_STATE_TOOL_TYPE, { pixelData });

      toolData = getToolState(element, TOOL_STATE_TOOL_TYPE);
    }

    // Draw previous image, unless this is a new image, then don't!
    if (imageBitmap && !configuration.newImage) {
      this._drawImageBitmap (evt);
    }

    if (configuration.newImage) {
      configuration.newImage = false;
    }

    // Call the hover event for the brush
    this.renderBrush(evt);

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
      getPixelData: () => pixelData,
    };

    cornerstone.storedPixelDataToCanvasImageDataColorLUT(image, colorLut.Table, imageData.data);

    const canvasTopLeft = external.cornerstone.pixelToCanvas(eventData.element, {x: 0, y: 0});
    const canvasBottomRight = external.cornerstone.pixelToCanvas(eventData.element, {x: eventData.image.width, y: eventData.image.height});
    const canvasWidth = canvasBottomRight.x - canvasTopLeft.x;
    const canvasHeight = canvasBottomRight.y - canvasTopLeft.y;

    window.createImageBitmap(imageData).then((newImageBitmap) => {
      this._imageBitmap = newImageBitmap;
      toolData.data[0].invalidated = false;
      this._drawImageBitmap(evt);
    });
  }

  _drawImageBitmap (e) {
    const eventData = e.detail;
    const canvasTopLeft = external.cornerstone.pixelToCanvas(eventData.element, {x: 0, y: 0});
    const canvasBottomRight = external.cornerstone.pixelToCanvas(eventData.element, {x: eventData.image.width, y: eventData.image.height});
    const canvasWidth = canvasBottomRight.x - canvasTopLeft.x;
    const canvasHeight = canvasBottomRight.y - canvasTopLeft.y;

    eventData.canvasContext.imageSmoothingEnabled = false;
    eventData.canvasContext.drawImage(this._imageBitmap, canvasTopLeft.x, canvasTopLeft.y, canvasWidth, canvasHeight);
  }
  }

  activeCallback (evt) {
    const eventData = evt.detail;
    const element = eventData.element;

    const { cornerstone } = external;

    element.removeEventListener(EVENTS.NEW_IMAGE, onNewImageCallback);
    element.addEventListener(EVENTS.NEW_IMAGE, onNewImageCallback);

    const configuration = this.configuration;
    let colormapId = configuration.colormapId;

    if (!colormapId) {
      colormapId = 'BrushColorMap';

      const colormap = cornerstone.colors.getColormap(colormapId);

      // TODO expand color set and put in stateManagement somewhere, e.g. brushToolColors.js.
      colormap.setNumberOfColors(2);
      colormap.setColor(0, [0, 0, 0, 0]);
      colormap.setColor(1, [255, 0, 0, 255]);

      configuration.colormapId = colormapId;
    }

    const enabledElement = external.cornerstone.getEnabledElement(element);
    const { width, height } = enabledElement.image;

    const pixelData = new Uint8ClampedArray(width * height);

    let toolData = getToolState(element, TOOL_STATE_TOOL_TYPE);

    if (!toolData) {
      const pixelData = new Uint8ClampedArray(eventData.image.width * eventData.image.height);
      addToolState(element, TOOL_STATE_TOOL_TYPE, { pixelData });
    }

  }

  passiveCallback (evt) {
    const eventData = evt.detail;
    const element = eventData.element;

    element.removeEventListener(EVENTS.NEW_IMAGE, onNewImageCallback);
    element.addEventListener(EVENTS.NEW_IMAGE, onNewImageCallback);
  }
}
