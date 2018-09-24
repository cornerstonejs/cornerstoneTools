import store from '../store/index.js';
import getActiveToolsForElement from '../store/getActiveToolsForElement.js';
import { getToolState, addToolState } from '../stateManagement/toolState.js';
import external from '../externalModules.js';
import BaseBrushTool from '../base/BaseBrushTool.js';
import { getNewContext } from '../util/drawing.js';

const { state, getters, setters } = store.modules.brush;

/**
 * Used to redraw the brush label map data per render.
 *
 * @param {Object} evt - The event.
 */
export default function (evt) {
  const eventData = evt.detail;
  const element = eventData.element;
  const maxSegmentations = BaseBrushTool.getNumberOfColors();
  let toolData = getToolState(
    element,
    BaseBrushTool.getReferencedToolDataName()
  );

  if (!toolData) {
    // Make toolData array as big as max number of segmentations.
    for (let i = 0; i < maxSegmentations; i++) {
      addToolState(element, BaseBrushTool.getReferencedToolDataName(), {});
    }

    toolData = getToolState(element, BaseBrushTool.getReferencedToolDataName());

    // TEMP: HACK: Create first pixel data such that the tool has some data and the brush
    // Cursor can be rendered. Can be replaced once we have a mechanism for SVG cursors.
    const newPixelData = new Uint8ClampedArray(
      eventData.image.width * eventData.image.height
    );

    toolData.data[0].pixelData = newPixelData;

    toolData = getToolState(element, BaseBrushTool.getReferencedToolDataName());
  }

  const enabledElement = external.cornerstone.getEnabledElement(element);
  const enabledElementUID = enabledElement.uuid;

  const segData = {
    visibleSegmentations: getters.visibleSegmentationsForElement(
      enabledElementUID
    ),
    imageBitmapCache: getters.imageBitmapCacheForElement(enabledElementUID),
    toolData
  };

  for (let segIndex = 0; segIndex < maxSegmentations; segIndex++) {
    if (shouldRenderSegmentation(evt, segIndex, segData)) {
      renderSegmentation(evt, segIndex, segData);
    }
  }
}

function shouldRenderSegmentation (evt, segIndex, segData) {
  const element = evt.detail.element;
  const toolData = segData.toolData;
  const visibleSegmentations = segData.visibleSegmentations;

  if (!toolData.data[segIndex].pixelData) {
    // No data, no render.
    return false;
  }

  if (visibleSegmentations[segIndex]) {
    // Has data and marked as visible, render!
    return true;
  }

  const currentColor = state.drawColorId;

  if (currentColor !== segIndex) {
    // Hidden and not current color, don't render.
    return false;
  }

  // Check that a brush tool is active.
  const activeTools = getActiveToolsForElement(element, store.state.tools);
  const brushTools = activeTools.filter((tool) => tool instanceof BaseBrushTool);

  if (brushTools.length > 0) {
    // Active brush tool with same color, render!
    return true;
  }

  return false;
}

function renderSegmentation (evt, segIndex, segData) {
  const toolData = segData.toolData;
  const imageBitmapCache = segData.imageBitmapCache;
  const visibleSegmentations = segData.visibleSegmentations;

  // Draw previous image if cached.
  if (imageBitmapCache && imageBitmapCache[segIndex]) {
    _drawImageBitmap(
      evt,
      imageBitmapCache[segIndex],
      visibleSegmentations[segIndex]
    );
  }

  if (toolData.data[segIndex].invalidated) {
    createNewBitmapAndQueueRenderOfSegmentation(evt, toolData, segIndex);
  }
}

function createNewBitmapAndQueueRenderOfSegmentation (evt, toolData, segIndex) {
  const eventData = evt.detail;
  const element = eventData.element;
  const enabledElement = external.cornerstone.getEnabledElement(element);

  const pixelData = toolData.data[segIndex].pixelData;

  const colormapId = state.colorMapId;
  const colormap = external.cornerstone.colors.getColormap(colormapId);
  const colorLutTable = [[0, 0, 0, 0], colormap.getColor(segIndex)];

  const imageData = new ImageData(
    eventData.image.width,
    eventData.image.height
  );
  const image = {
    stats: {},
    minPixelValue: 0,
    getPixelData: () => pixelData
  };

  external.cornerstone.storedPixelDataToCanvasImageDataColorLUT(
    image,
    colorLutTable,
    imageData.data
  );

  window.createImageBitmap(imageData).then((newImageBitmap) => {
    setters.setImageBitmapCacheForElement(
      enabledElement.uuid,
      segIndex,
      newImageBitmap
    );
    toolData.data[segIndex].invalidated = false;

    external.cornerstone.updateImage(eventData.element);
  });
}

/**
 * Draws the ImageBitmap the canvas.
 *
 * @param  {Object} evt description
 */
function _drawImageBitmap (evt, imageBitmap, alwaysVisible) {
  const eventData = evt.detail;
  const context = getNewContext(eventData.canvasContext.canvas);

  const canvasTopLeft = external.cornerstone.pixelToCanvas(eventData.element, {
    x: 0,
    y: 0
  });
  const canvasBottomRight = external.cornerstone.pixelToCanvas(
    eventData.element,
    {
      x: eventData.image.width,
      y: eventData.image.height
    }
  );
  const canvasWidth = canvasBottomRight.x - canvasTopLeft.x;
  const canvasHeight = canvasBottomRight.y - canvasTopLeft.y;

  context.imageSmoothingEnabled = false;
  context.globalAlpha = getLayerAlpha(alwaysVisible);
  context.drawImage(
    imageBitmap,
    canvasTopLeft.x,
    canvasTopLeft.y,
    canvasWidth,
    canvasHeight
  );
  context.globalAlpha = 1.0;
}

function getLayerAlpha (alwaysVisible) {
  if (alwaysVisible) {
    return state.alpha;
  }

  return state.hiddenButActiveAlpha;
}
