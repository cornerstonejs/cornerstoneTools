import store from '../store/index.js';
import { getToolState, addToolState } from '../stateManagement/toolState.js';
import external from '../externalModules.js';
import baseBrushTool from '../base/baseBrushTool.js';
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
  const maxSegmentations = baseBrushTool.getNumberOfColors();
  let toolData = getToolState(element, baseBrushTool.getReferencedToolDataName());

  if (!toolData) { // Make toolData array as big as max number of segmentations.
    for (let i = 0; i < maxSegmentations; i++) {
      addToolState(element, baseBrushTool.getReferencedToolDataName(), {});
    }

    toolData = getToolState(element, baseBrushTool.getReferencedToolDataName());

    // TEMP: HACK: Create first pixel data such that the tool has some data and the brush
    // cursor can be rendered. Can be replaced once we have a mechanism for SVG cursors.
    const newPixelData = new Uint8ClampedArray(eventData.image.width * eventData.image.height);
    toolData.data[0].pixelData = newPixelData;

    toolData = getToolState(element, baseBrushTool.getReferencedToolDataName());
  }

  for (let i = 0; i < maxSegmentations; i++) {
    if (toolData.data[i].pixelData) {
      renderSegmentation(evt, toolData, i);
    }
  }

}



function renderSegmentation (evt, toolData, segmentationIndex) {
  const eventData = evt.detail;
  const element = eventData.element;
  const enabledElement = external.cornerstone.getEnabledElement(element);

  const imageBitmapCache = brushState.getters.imageBitmapCacheForElement(enabledElement.toolDataUID, segmentationIndex);

  // Draw previous image if cached.
  if (imageBitmapCache) {
    _drawImageBitmap(evt, imageBitmapCache);
  }

  if (toolData.data[segmentationIndex].invalidated) {
    createNewBitmapAndQueueRenderOfSegmentation(evt, toolData, segmentationIndex);
  }

}


function createNewBitmapAndQueueRenderOfSegmentation(evt, toolData, segmentationIndex) {
  const eventData = evt.detail;
  const element = eventData.element;
  const enabledElement = external.cornerstone.getEnabledElement(element);

  const pixelData = toolData.data[segmentationIndex].pixelData;

  const colormapId = brushState.getters.colorMapId();
  const colormap = external.cornerstone.colors.getColormap(colormapId);
  const colorLutTable = [
    [0, 0, 0, 0],
    colormap.getColor(segmentationIndex)
  ];

  const imageData = new ImageData(eventData.image.width, eventData.image.height);
  const image = {
    stats: {},
    minPixelValue: 0,
    getPixelData: () => pixelData
  };

  external.cornerstone.storedPixelDataToCanvasImageDataColorLUT(image, colorLutTable, imageData.data);

  window.createImageBitmap(imageData).then((newImageBitmap) => {
    brushState.mutations.SET_ELEMENT_IMAGE_BITMAP_CACHE(enabledElement.toolDataUID, segmentationIndex, newImageBitmap);
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
