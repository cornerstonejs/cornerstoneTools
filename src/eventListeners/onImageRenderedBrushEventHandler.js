import store from '../store/index.js';
import { getToolState, addToolState } from '../stateManagement/toolState.js';
import external from '../externalModules.js';
import { getNewContext } from '../util/drawing.js';

const brushState = store.modules.brush;

/**
 * Used to redraw the brush label map data per render.
 *
 * @param {Object} evt - The event.
 */
export default function (evt) {
  const eventData = evt.detail;
  const element = eventData.element;
  let toolData = getToolState(element, 'brush');
  let pixelData;

  if (toolData) {
    pixelData = toolData.data[0].pixelData;
  } else {
    pixelData = new Uint8ClampedArray(eventData.image.width * eventData.image.height);
    addToolState(element, 'brush', { pixelData });
    toolData = getToolState(element, 'brush');
  }

  const enabledElement = external.cornerstone.getEnabledElement(element);
  const imageBitmapCache = brushState.getters.imageBitmapCacheForElement(enabledElement.toolDataUID);

  // Draw previous image, unless this is a new image, then don't!
  if (imageBitmapCache) {
    _drawImageBitmap(evt, imageBitmapCache);
  }

  //if (!toolData.data[0].invalidated) {
  //  return;
  //}

  const colormapId = brushState.getters.colorMapId();
  const colormap = external.cornerstone.colors.getColormap(colormapId);
  const colorLut = colormap.createLookupTable();

  const imageData = new ImageData(eventData.image.width, eventData.image.height);
  const image = {
    stats: {},
    minPixelValue: 0,
    getPixelData: () => pixelData
  };

  external.cornerstone.storedPixelDataToCanvasImageDataColorLUT(image, colorLut.Table, imageData.data);

  window.createImageBitmap(imageData).then((newImageBitmap) => {
    brushState.mutations.SET_ELEMENT_IMAGE_BITMAP_CACHE(enabledElement.toolDataUID, newImageBitmap);
    toolData.data[0].invalidated = false;

    external.cornerstone.updateImage(eventData.element);
  });
}

/**
 * Draws the ImageBitmap the canvas.
 *
 * @param  {Object} evt description
 */
function _drawImageBitmap (evt, imageBitmapCache) {
  const eventData = evt.detail;
  const context = getNewContext(eventData.canvasContext.canvas);

  const canvasTopLeft = external.cornerstone.pixelToCanvas(eventData.element, {
    x: 0,
    y: 0
  });
  const canvasBottomRight = external.cornerstone.pixelToCanvas(eventData.element, {
    x: eventData.image.width,
    y: eventData.image.height
  });
  const canvasWidth = canvasBottomRight.x - canvasTopLeft.x;
  const canvasHeight = canvasBottomRight.y - canvasTopLeft.y;

  context.imageSmoothingEnabled = false;
  context.globalAlpha = brushState.getters.alpha();
  context.drawImage(imageBitmapCache, canvasTopLeft.x, canvasTopLeft.y, canvasWidth, canvasHeight);
  context.globalAlpha = 1.0;
}
