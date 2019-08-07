import store from '../store/index.js';
import external from '../externalModules.js';
import {
  getNewContext,
  resetCanvasContextTransform,
  transformCanvasContext,
} from '../drawing/index.js';

import { getLogger } from '../util/logger.js';

const logger = getLogger('eventListeners:onImageRenderedBrushEventHandler');

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

const { state, getters } = store.modules.brush;

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

  const {
    activeLabelmapIndex,
    labelmaps3D,
    currentImageIdIndex,
  } = getters.labelmaps3D(element);

  if (!labelmaps3D) {
    return;
  }

  // TODO -> Configurable outline by global brush module config.
  // TODO -> outline for inactive labelmaps? Discuss.

  renderInactiveLabelMaps(
    evt,
    labelmaps3D,
    activeLabelmapIndex,
    currentImageIdIndex
  );
  renderActiveLabelMap(
    evt,
    labelmaps3D,
    activeLabelmapIndex,
    currentImageIdIndex
  );
}

/**
 * RenderActiveLabelMap - Renders the active label map for this element.
 *
 * @param  {Object} evt                 The cornerstone event.
 * @param  {Object[]} labelmaps3D       An array of labelmaps.
 * @param  {number} activeLabelmapIndex The index of the active label map.
 * @param  {number} currentImageIdIndex The in-stack image position.
 * @returns {null}
 */
function renderActiveLabelMap(
  evt,
  labelmaps3D,
  activeLabelmapIndex,
  currentImageIdIndex
) {
  const labelmap3D = labelmaps3D[activeLabelmapIndex];

  if (!labelmap3D) {
    return;
  }

  const labelmap2D = labelmap3D.labelmaps2D[currentImageIdIndex];

  if (labelmap2D) {
    renderSegmentation(evt, labelmap3D, activeLabelmapIndex, labelmap2D, true);
    // TODO - Add a global config for this.
    renderOutline(evt, labelmap3D, activeLabelmapIndex, labelmap2D);
  }
}

/**
 * RenderInactiveLabelMaps - Renders all the inactive label maps if the global
 * alphaOfInactiveLabelmap setting is not zero.
 *
 * @param  {Object} evt                 The cornerstone event.
 * @param  {Object[]} labelmaps3D       An array of labelmaps.
 * @param  {number} activeLabelmapIndex The index of the active label map.
 * @param  {number} currentImageIdIndex The in-stack image position.
 * @returns {null}
 */
function renderInactiveLabelMaps(
  evt,
  labelmaps3D,
  activeLabelmapIndex,
  currentImageIdIndex
) {
  if (state.alphaOfInactiveLabelmap === 0) {
    // Don't bother rendering a whole labelmaps with full transparency!
    return;
  }

  for (let i = 0; i < labelmaps3D.length; i++) {
    const labelmap3D = labelmaps3D[i];

    if (i === activeLabelmapIndex || !labelmap3D) {
      continue;
    }

    const labelmap2D = labelmap3D.labelmaps2D[currentImageIdIndex];

    if (labelmap2D) {
      renderSegmentation(evt, labelmap3D, i, labelmap2D, false);
    }
  }
}

/**
 * @param  {Object} evt             The cornerstone event.
 * @param  {Object} labelmap3D      The 3D labelmap.
 * @param  {number} labelmapIndex   The index of the labelmap.
 * @param  {Object} labelmap2D      The 2D labelmap for this current image.
 */
function renderOutline(evt, labelmap3D, labelmapIndex, labelmap2D) {
  // TODO -> We need to store the cached labelmap.
  if (!labelmap2D.invalidated) {
    return;
  }

  const eventData = evt.detail;
  const { element, image, canvasContext } = eventData;
  const { canvas } = canvasContext;
  const segmentationData = labelmap2D.pixelData;
  const cols = image.width;

  const enabledElement = external.cornerstone.getEnabledElement(element);

  const { width, height } = canvas;

  logger.warn('test');

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      //pixelOnBorder({ x, y }, segmentationData, width, height, cols, element);
    }
  }

  const colorMapId = `${state.colorMapId}_${labelmapIndex}`;

  //const getPixelIndex = coord => coord[1] * cols + coord[0];
  //const getPixelCoordinateFromPixelIndex = pixelIndex => {
  //  return [Math.floor(pixelIndex / cols), pixelIndex % cols];
  //};
}
/*
function pixelOnBorder(
  point,
  segmentationData,
  width,
  height,
  enabledElement,
  cols
) {
  const thickness = 3; // TODO -> Don't hardcode.

  const coord = external.cornerstone.canvasToPixel(element, point);

  coord.x = Math.floor(coord.x);
  coord.y = Math.floor(coord.y);

  const getPixelIndex = pixel => pixel.y * cols + pixel.y;

  const segmentIndex = segmentationData[getPixelIndex(coord)];

  if (segmentIndex === 1) {
    logger.warn(coord);
  }

  // TODO -> Outside image range, skip.

  /*
  for (let i = -thickness; i <= thickness; ++i) {
    for (let j = -thickness; j <= thickness; ++j) {

    }
  }

}
*/

/*
function canvas line method() {
  // Check pixel above
  if (coord[1] - 1 >= 0) {
    const pixelIndex = getPixelIndex(coord[0], coord[1] - 1);
    const segmentIndexAbove = pixelData[pixelIndex];

    if (segmentIndexAbove !== segmentIndex) {
      // TODO -> draw line above in segmentIndex color.
    }
  } else {
    // Segment on Edge, draw line.
    // TODO -> draw line above in segmentIndex color.
  }

  // Check pixel below
  if (coord[1] + 1 < rows) {
    const pixelIndex = getPixelIndex(coord[0], coord[1] + 1);
    const segmentIndexBelow = pixelData[pixelIndex];

    if (segmentIndexBelow !== segmentIndex) {
      // TODO -> draw line below in segmentIndex color.
    }
  } else {
    // Segment on Edge, draw line.
    // TODO -> draw line below in segmentIndex color.
  }

  // Check pixel to the left
  if (coord[0] - 1 >= 0) {
    const pixelIndex = getPixelIndex(coord[0] - 1, coord[1]);
    const segmentIndexLeft = pixelData[pixelIndex];

    if (segmentIndexLeft !== segmentIndex) {
      // TODO -> draw line to left in segmentIndex color.
    }
  } else {
    // Segment on Edge, draw line.
    // TODO -> draw line to left in segmentIndex color.
  }

  // Check pixel to the right
  if (coord[0] + 1 < cols) {
    const pixelIndex = getPixelIndex(coord[0] + 1, coord[1]);
    const segmentIndexRight = pixelData[pixelIndex];

    if (segmentIndexRight !== segmentIndex) {
      // TODO -> draw line to right in segmentIndex color.
    }
  } else {
    // Segment on Edge, draw line.
    // TODO -> draw line to left in segmentIndex color.
  }
}
*/

/**
 * RenderSegmentation - Renders the labelmap2D to the canvas.
 *
 * @param  {Object} evt              The cornerstone event.
 * @param  {Object} labelmap3D       The 3D labelmap.
 * @param  {number} labelmapIndex    The index of the labelmap.
 * @param  {Object} labelmap2D       The 2D labelmap for this current image.
 * @param  {number} isActiveLabelMap   Whether the labelmap is active.
 * @returns {null}
 */
function renderSegmentation(
  evt,
  labelmap3D,
  labelmapIndex,
  labelmap2D,
  isActiveLabelMap
) {
  // Draw previous image if cached.
  if (labelmap3D.imageBitmapCache) {
    _drawImageBitmap(evt, labelmap3D.imageBitmapCache, isActiveLabelMap);
  }

  if (labelmap2D.invalidated) {
    createNewBitmapAndQueueRenderOfSegmentation(
      evt,
      labelmap3D,
      labelmapIndex,
      labelmap2D
    );
  }
}

/**
 * CreateNewBitmapAndQueueRenderOfSegmentation - Creates a bitmap from the
 * labelmap2D and queues a re-render once it is built.
 *
 * @param  {Object} evt           The cornerstone event.
 * @param  {Object} labelmap3D    The 3D labelmap.
 * @param  {number} labelmapIndex The index of the labelmap.
 * @param  {Object} labelmap2D    The 2D labelmap for the current image.
 * @returns {null}
 */
function createNewBitmapAndQueueRenderOfSegmentation(
  evt,
  labelmap3D,
  labelmapIndex,
  labelmap2D
) {
  const eventData = evt.detail;
  const element = eventData.element;

  const pixelData = labelmap2D.pixelData;

  const imageData = new ImageData(
    eventData.image.width,
    eventData.image.height
  );
  const image = {
    stats: {},
    minPixelValue: 0,
    getPixelData: () => pixelData,
  };

  const colorMapId = `${state.colorMapId}_${labelmapIndex}`;

  external.cornerstone.storedPixelDataToCanvasImageDataColorLUT(
    image,
    state.colorLutTables[colorMapId],
    imageData.data
  );

  window.createImageBitmap(imageData).then(newImageBitmap => {
    labelmap3D.imageBitmapCache = newImageBitmap;
    labelmap2D.invalidated = false;

    external.cornerstone.updateImage(element);
  });
}

/**
 * Draws the ImageBitmap the canvas.
 *
 * @private
 * @param  {Object} evt               The cornerstone event.
 * @param {ImageBitmap} imageBitmap   The ImageBitmap to draw.
 * @param {boolean} isActiveLabelMap  Whether the labelmap is active.
 * @returns {null}
 */
function _drawImageBitmap(evt, imageBitmap, isActiveLabelMap) {
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
  context.globalAlpha = isActiveLabelMap
    ? state.alpha
    : state.alphaOfInactiveLabelmap;

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
