import {
  getNewContext,
  resetCanvasContextTransform,
  transformCanvasContext,
} from '../drawing/index.js';

import BaseBrushTool from './../tools/base/BaseBrushTool.js';
import external from '../externalModules.js';
import getActiveToolsForElement from '../store/getActiveToolsForElement.js';
import { getToolState } from '../stateManagement/toolState.js';
import store from '../store/index.js';

/* Safari and Edge polyfill for createImageBitmap
 * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/createImageBitmap
 */

// TODO: Do we still need this? I've yanked the package for now
// It should be covered by @babel/runtime and plugin-transform-runtime:
// https://babeljs.io/docs/en/babel-plugin-transform-runtime
// @James, I think Babel should take care of this for us
// Import regeneratorRuntime from "regenerator-runtime";

if (!('createImageBitmap' in window)) {
  window.createImageBitmap = function(imageData) {
    return new Promise(resolve => {
      const img = document.createElement('img');

      img.addEventListener('load', function() {
        resolve(this);
      });

      const conversionCanvas = document.createElement('canvas');

      conversionCanvas.width = imageData.width;
      conversionCanvas.height = imageData.height;

      const conversionCanvasContext = conversionCanvas.getContext('2d');

      conversionCanvasContext.putImageData(
        imageData,
        0,
        0,
        0,
        0,
        conversionCanvas.width,
        conversionCanvas.height
      );
      img.src = conversionCanvas.toDataURL();
    });
  };
}

const { state, getters, setters } = store.modules.brush;

/**
 * Used to redraw the brush label map data per render.
 *
 * @private
 * @param {Object} evt - The event.
 * @returns {void}
 */
export default function(evt) {
  const eventData = evt.detail;
  const element = eventData.element;
  const maxSegmentations = BaseBrushTool.getNumberOfColors();

  const toolData = getToolState(
    element,
    BaseBrushTool.getReferencedToolDataName()
  );

  if (!toolData) {
    return;
  }

  const enabledElement = external.cornerstone.getEnabledElement(element);
  const enabledElementUID = enabledElement.uuid;

  const segData = {
    visibleSegmentations: getters.visibleSegmentationsForElement(
      enabledElementUID
    ),
    imageBitmapCache: getters.imageBitmapCacheForElement(enabledElementUID),
    toolData,
  };

  for (let segIndex = 0; segIndex < maxSegmentations; segIndex++) {
    if (shouldRenderSegmentation(evt, segIndex, segData)) {
      renderSegmentation(evt, segIndex, segData);
    }
  }
}

function shouldRenderSegmentation(evt, segIndex, segData) {
  const element = evt.detail.element;
  const toolData = segData.toolData;
  const visibleSegmentations = segData.visibleSegmentations;

  if (!toolData.data[segIndex] || !toolData.data[segIndex].pixelData) {
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
  const brushTools = activeTools.filter(tool => tool instanceof BaseBrushTool);

  if (brushTools.length > 0) {
    // Active brush tool with same color, render!
    return true;
  }

  return false;
}

function renderSegmentation(evt, segIndex, segData) {
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

function createNewBitmapAndQueueRenderOfSegmentation(evt, toolData, segIndex) {
  const eventData = evt.detail;
  const element = eventData.element;
  const enabledElement = external.cornerstone.getEnabledElement(element);

  const pixelData = toolData.data[segIndex].pixelData;
  const imageSpecificSegmentationAlpha = toolData.data[segIndex].alpha;

  if (!pixelData) {
    return;
  }

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
    getPixelData: () => pixelData,
  };

  const hasImageSpecificSegmentationAlpha =
    imageSpecificSegmentationAlpha !== undefined;

  if (hasImageSpecificSegmentationAlpha) {
    colorLutTable[1][3] = imageSpecificSegmentationAlpha;
  }

  external.cornerstone.storedPixelDataToCanvasImageDataColorLUT(
    image,
    colorLutTable,
    imageData.data
  );

  window.createImageBitmap(imageData).then(newImageBitmap => {
    setters.imageBitmapCacheForElement(
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
 * @private
 * @param  {Object} evt description
 * @param {ImageBitmap} imageBitmap
 * @param {Boolean} alwaysVisible
 * @returns {void}
 */
function _drawImageBitmap(evt, imageBitmap, alwaysVisible) {
  const eventData = evt.detail;
  const context = getNewContext(eventData.canvasContext.canvas);

  const canvasTopLeft = external.cornerstone.pixelToCanvas(eventData.element, {
    x: 0,
    y: 0,
  });

  const canvasTopRight = external.cornerstone.pixelToCanvas(eventData.element, {
    x: eventData.image.width,
    y: 0,
  });

  const canvasBottomRight = external.cornerstone.pixelToCanvas(
    eventData.element,
    {
      x: eventData.image.width,
      y: eventData.image.height,
    }
  );

  const cornerstoneCanvasWidth = external.cornerstoneMath.point.distance(
    canvasTopLeft,
    canvasTopRight
  );
  const cornerstoneCanvasHeight = external.cornerstoneMath.point.distance(
    canvasTopRight,
    canvasBottomRight
  );

  const canvas = eventData.canvasContext.canvas;
  const viewport = eventData.viewport;

  context.imageSmoothingEnabled = false;
  context.globalAlpha = getLayerAlpha(alwaysVisible);

  transformCanvasContext(context, canvas, viewport);

  const canvasViewportTranslation = {
    x: viewport.translation.x * viewport.scale,
    y: viewport.translation.y * viewport.scale,
  };

  context.drawImage(
    imageBitmap,
    canvas.width / 2 - cornerstoneCanvasWidth / 2 + canvasViewportTranslation.x,
    canvas.height / 2 -
      cornerstoneCanvasHeight / 2 +
      canvasViewportTranslation.y,
    cornerstoneCanvasWidth,
    cornerstoneCanvasHeight
  );

  context.globalAlpha = 1.0;

  resetCanvasContextTransform(context);
}

function getLayerAlpha(alwaysVisible) {
  if (alwaysVisible) {
    return state.alpha;
  }

  return state.hiddenButActiveAlpha;
}
