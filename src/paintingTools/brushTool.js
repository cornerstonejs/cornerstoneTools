import EVENTS from '../events.js';
import external from '../externalModules.js';
import { getToolState, addToolState } from '../stateManagement/toolState.js';
import mouseButtonTool from '../imageTools/mouseButtonTool.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { setToolOptions, getToolOptions } from '../toolOptions.js';
import {brush} from "./brush";

// TEMP
import { globalImageIdSpecificToolStateManager } from '../stateManagement/imageIdSpecificStateManager.js';
// TEMP


const TOOL_STATE_TOOL_TYPE = 'brush';

/* Safari and Edge polyfill for createImageBitmap
 * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/createImageBitmap
 */

const conversionCanvas = document.createElement('canvas');

if (!('createImageBitmap' in window)) {
    window.createImageBitmap = async function(imageData) {
        return new Promise((resolve,reject) => {
            let img = document.createElement('img');
            img.addEventListener('load', function() {

              resolve(this);
            });

            const conversionCanvasContext = conversionCanvas.getContext('2d');

            conversionCanvasContext.putImageData(imageData, 0, 0, 0, 0, conversionCanvas.width, conversionCanvas.height);
            img.src = conversionCanvas.toDataURL();
        });
    }
}



export default function brushTool (brushToolInterface) {
  const toolType = brushToolInterface.toolType;

  function mouseMoveCallback (e) {
    brushToolInterface.onMouseMove(e);
  }

  function onNewImageCallback(e) {
    brushToolInterface.onNewImageCallback(e);
  }

  function mouseUpCallback (e) {
    const eventData = e.detail;
    const element = eventData.element;

    brushToolInterface.onMouseUp(e);

    element.removeEventListener(EVENTS.MOUSE_DRAG, mouseMoveCallback);
    element.removeEventListener(EVENTS.MOUSE_DRAG, dragCallback);
    element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
    element.removeEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
  }

  function dragCallback (e) {
    brushToolInterface.onDrag(e);

    return false;
  }

  function mouseDownActivateCallback (e) {
    const eventData = e.detail;
    const element = eventData.element;
    const options = getToolOptions(toolType, element);

    if (isMouseButtonEnabled(eventData.which, options.mouseButtonMask)) {
      element.addEventListener(EVENTS.MOUSE_DRAG, dragCallback);
      element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
      element.addEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
      brushToolInterface.onMouseDown(e);

      return false;
    }

    element.addEventListener(EVENTS.MOUSE_DRAG, mouseMoveCallback);
    element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
  }

  let imageBitmap

  let killFrames = false;

  function onImageRendered (e) {
    const { cornerstone } = external;
    const eventData = e.detail;
    const configuration = brushTool.getConfiguration();

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
      drawImageBitmap (e, imageBitmap);
    }

    if (configuration.newImage) {
      configuration.newImage = false;
    }

    // Call the hover event for the brush
    brushToolInterface.onImageRendered(e);

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
      imageBitmap = newImageBitmap;
      toolData.data[0].invalidated = false;
      drawImageBitmap(e, imageBitmap);
    });
  }

  function drawImageBitmap (e, imageBitmap) {
    const eventData = e.detail;
    const canvasTopLeft = external.cornerstone.pixelToCanvas(eventData.element, {x: 0, y: 0});
    const canvasBottomRight = external.cornerstone.pixelToCanvas(eventData.element, {x: eventData.image.width, y: eventData.image.height});
    const canvasWidth = canvasBottomRight.x - canvasTopLeft.x;
    const canvasHeight = canvasBottomRight.y - canvasTopLeft.y;

    eventData.canvasContext.imageSmoothingEnabled = false;
    eventData.canvasContext.drawImage(imageBitmap, canvasTopLeft.x, canvasTopLeft.y, canvasWidth, canvasHeight);
  }

  function activate (element, mouseButtonMask) {
    const { cornerstone } = external;

    setToolOptions(toolType, element, { mouseButtonMask });

    element.removeEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
    element.addEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);

    element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivateCallback);
    element.addEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivateCallback);

    element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
    element.addEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);

    element.removeEventListener(EVENTS.NEW_IMAGE, onNewImageCallback);
    element.addEventListener(EVENTS.NEW_IMAGE, onNewImageCallback);

    const configuration = brushTool.getConfiguration();
    let colormapId = configuration.colormapId;

    if (!colormapId) {
      colormapId = 'BrushColorMap';

      const colormap = cornerstone.colors.getColormap(colormapId);

      colormap.setNumberOfColors(2);
      colormap.setColor(0, [0, 0, 0, 0]);
      colormap.setColor(1, [255, 0, 0, 255]);

      configuration.colormapId = colormapId;
    }

    const enabledElement = external.cornerstone.getEnabledElement(element);
    const { width, height } = enabledElement.image;

    const pixelData = new Uint8ClampedArray(width * height);

    addToolState(element, TOOL_STATE_TOOL_TYPE, { pixelData });

    brushTool.setConfiguration(configuration);

    //TEMP TEST
    const canvasTopLeft = external.cornerstone.pixelToCanvas(eventData.element, {x: 0, y: 0});
    const canvasBottomRight = external.cornerstone.pixelToCanvas(eventData.element, {x: eventData.image.width, y: eventData.image.height});
    const canvasWidth = canvasBottomRight.x - canvasTopLeft.x;
    const canvasHeight = canvasBottomRight.y - canvasTopLeft.y;

    const conversionCanvasContext = conversionCanvas.getContext('2d');
    conversionCanvasContext.width = canvasWidth;
    conversionCanvasContext.Height = canvasHeight;
    //TEMP TEST
  }

  function deactivate (element) {
    element.removeEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
    element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownActivateCallback);
    element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);

    element.removeEventListener(EVENTS.NEW_IMAGE, onNewImageCallback);
    element.addEventListener(EVENTS.NEW_IMAGE, onNewImageCallback);
  }

  const brushTool = mouseButtonTool({
    mouseMoveCallback,
    mouseDownActivateCallback,
    onImageRendered,
    deactivate
  });

  brushTool.activate = activate;

  return brushTool;
}
