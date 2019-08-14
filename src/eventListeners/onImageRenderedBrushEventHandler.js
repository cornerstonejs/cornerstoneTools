import store from '../store/index.js';
import external from '../externalModules.js';
import {
  getNewContext,
  resetCanvasContextTransform,
  transformCanvasContext,
  draw,
  drawLine,
  drawLines,
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
 * RenderOutline - Renders the outlines of segments to the canvas.
 *
 * @param  {Object} evt             The cornerstone event.
 * @param  {Object} labelmap3D      The 3D labelmap.
 * @param  {number} labelmapIndex   The index of the labelmap.
 * @param  {Object} labelmap2D      The 2D labelmap for this current image.
 * @returns {null}
 */
function renderOutline(evt, labelmap3D, labelmapIndex, labelmap2D) {
  const eventData = evt.detail;
  const { element, canvasContext } = eventData;

  const lineWidth = state.outlineWidth || 1;
  const lineSegments = getLineSegments(
    eventData,
    labelmap3D,
    labelmap2D,
    lineWidth
  );

  const context = getNewContext(canvasContext.canvas);
  const colorMapId = `${state.colorMapId}_${labelmapIndex}`;
  const colorLutTable = state.colorLutTables[colorMapId];

  const previousAlpha = context.globalAlpha;

  context.globalAlpha = state.outlineAlpha;

  // Draw outlines.
  draw(context, context => {
    for (let i = 0; i < lineSegments.length; i++) {
      if (lineSegments[i]) {
        const color = colorLutTable[i];

        drawLines(
          context,
          element,
          lineSegments[i],
          {
            color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1.0 )`,
            lineWidth,
          },
          'canvas'
        );
      }
    }
  });

  context.globalAlpha = previousAlpha;
}

/**
 * GetLineSegments - Returns an object containing all the line segments to be
 * drawn the canvas.
 *
 * @param  {Object} eventData The eventdata associated with the cornerstone event.
 * @param  {Object} labelmap3D The 3D labelmap.
 * @param  {Object} labelmap2D The 2D labelmap for this current image.
 * @param  {number} lineWidth The width of the line segments.
 *
 * @returns {Object[][]} An array of arrays of lines for each segment.
 */
function getLineSegments(eventData, labelmap3D, labelmap2D, lineWidth) {
  const { element, image } = eventData;
  const cols = image.width;
  const rows = image.height;

  const pixelData = labelmap2D.pixelData;
  const activeSegmentIndex = labelmap3D.activeSegmentIndex;
  const lineSegments = [];

  labelmap2D.segmentsOnLabelmap.forEach(segmentIndex => {
    lineSegments[segmentIndex] = [];
  });

  // TEMP - Do this in a cleaner way.
  if (!lineSegments[activeSegmentIndex]) {
    lineSegments[activeSegmentIndex] = [];
  }

  const halfLineWidth = lineWidth / 2;

  const getPixelIndex = pixelCoord => pixelCoord[1] * cols + pixelCoord[0];
  const getPixelCoordinateFromPixelIndex = pixelIndex => ({
    x: pixelIndex % cols,
    y: Math.floor(pixelIndex / cols),
  });

  for (let i = 0; i < pixelData.length; i++) {
    const segmentIndex = pixelData[i];

    if (segmentIndex === 0) {
      continue;
    }

    const coord = getPixelCoordinateFromPixelIndex(i);

    // Check pixel above
    if (coord.y - 1 >= 0) {
      const pixelIndex = getPixelIndex([coord.x, coord.y - 1]);
      const segmentIndexAbove = pixelData[pixelIndex];

      if (segmentIndexAbove !== segmentIndex) {
        addTopOutline(
          lineSegments[segmentIndex],
          element,
          coord,
          halfLineWidth
        );
      }
    } else {
      // Segment on Edge, draw line.
      addTopOutline(lineSegments[segmentIndex], element, coord, halfLineWidth);
    }

    // Check pixel below
    if (coord.y + 1 < rows) {
      const pixelIndex = getPixelIndex([coord.x, coord.y + 1]);
      const segmentIndexBelow = pixelData[pixelIndex];

      if (segmentIndexBelow !== segmentIndex) {
        addBottomOutline(
          lineSegments[segmentIndex],
          element,
          coord,
          halfLineWidth
        );
      }
    } else {
      // Segment on Edge, draw line.
      addBottomOutline(
        lineSegments[segmentIndex],
        element,
        coord,
        halfLineWidth
      );
    }

    // Check pixel to the left
    if (coord.x - 1 >= 0) {
      const pixelIndex = getPixelIndex([coord.x - 1, coord.y]);
      const segmentIndexLeft = pixelData[pixelIndex];

      if (segmentIndexLeft !== segmentIndex) {
        addLeftOutline(
          lineSegments[segmentIndex],
          element,
          coord,
          halfLineWidth
        );
      }
    } else {
      // Segment on Edge, draw line.
      addLeftOutline(lineSegments[segmentIndex], element, coord, halfLineWidth);
    }

    // Check pixel to the right
    if (coord.x + 1 < cols) {
      const pixelIndex = getPixelIndex([coord.x + 1, coord.y]);
      const segmentIndexRight = pixelData[pixelIndex];

      if (segmentIndexRight !== segmentIndex) {
        addRightOutline(
          lineSegments[segmentIndex],
          element,
          coord,
          halfLineWidth
        );
      }
    } else {
      // Segment on Edge, draw line.
      addRightOutline(
        lineSegments[segmentIndex],
        element,
        coord,
        halfLineWidth
      );
    }
  }

  return lineSegments;
}

/**
 * AddTopOutline - adds an outline at the top of the pixel.
 *
 * @param  {Object[]} lineSegmentsForSegment - The list to append.
 * @param  {Object} element - The Cornerstone enabled element.
 * @param  {Object} coord - The pixel to add a line to.
 * @param  {number} halfLineWidth - Half the line width, to place line within the pixel.
 *
 * @returns {null}
 */
function addTopOutline(lineSegmentsForSegment, element, coord, halfLineWidth) {
  const { pixelToCanvas } = external.cornerstone;
  const start = pixelToCanvas(element, coord);
  const end = pixelToCanvas(element, { x: coord.x + 1, y: coord.y });

  start.y += halfLineWidth;
  end.y += halfLineWidth;

  lineSegmentsForSegment.push({
    start,
    end,
  });
}

/**
 * AddBottomOutline - adds an outline at the bottom of the pixel.
 *
 * @param  {Object[]} lineSegmentsForSegment - The list to append.
 * @param  {Object} element - The Cornerstone enabled element.
 * @param  {Object} coord - The pixel to add a line to.
 * @param  {number} halfLineWidth - Half the line width, to place line within the pixel.
 *
 * @returns {null}
 */
function addBottomOutline(
  lineSegmentsForSegment,
  element,
  coord,
  halfLineWidth
) {
  const { pixelToCanvas } = external.cornerstone;
  const start = pixelToCanvas(element, { x: coord.x, y: coord.y + 1 });
  const end = pixelToCanvas(element, { x: coord.x + 1, y: coord.y + 1 });

  start.y -= halfLineWidth;
  end.y -= halfLineWidth;

  lineSegmentsForSegment.push({
    start,
    end,
  });
}

/**
 * AddLeftOutline - adds an outline at the left side of the pixel.
 *
 * @param  {Object[]} lineSegmentsForSegment - The list to append.
 * @param  {Object} element - The Cornerstone enabled element.
 * @param  {Object} coord - The pixel to add a line to.
 * @param  {number} halfLineWidth - Half the line width, to place line within the pixel.
 *
 * @returns {null}
 */
function addLeftOutline(lineSegmentsForSegment, element, coord, halfLineWidth) {
  const { pixelToCanvas } = external.cornerstone;
  const start = pixelToCanvas(element, coord);
  const end = pixelToCanvas(element, { x: coord.x, y: coord.y + 1 });

  start.x += halfLineWidth;
  end.x += halfLineWidth;

  lineSegmentsForSegment.push({
    start,
    end,
  });
}

/**
 * AddRightOutline - adds an outline at the right side of the pixel.
 *
 * @param  {Object[]} lineSegmentsForSegment - The list to append.
 * @param  {Object} element - The Cornerstone enabled element.
 * @param  {Object} coord - The pixel to add a line to.
 * @param  {number} halfLineWidth - Half the line width, to place line within the pixel.
 *
 * @returns {null}
 */
function addRightOutline(
  lineSegmentsForSegment,
  element,
  coord,
  halfLineWidth
) {
  const { pixelToCanvas } = external.cornerstone;
  const start = pixelToCanvas(element, { x: coord.x + 1, y: coord.y });
  const end = pixelToCanvas(element, { x: coord.x + 1, y: coord.y + 1 });

  start.x -= halfLineWidth;
  end.x -= halfLineWidth;

  lineSegmentsForSegment.push({
    start,
    end,
  });
}

/**
 * RenderSegmentation - Renders the labelmap2D to the canvas.
 *
 * @param  {Object} evt              The cornerstone event.
 * @param  {Object} labelmap3D       The 3D labelmap.
 * @param  {number} labelmapIndex    The index of the labelmap.
 * @param  {Object} labelmap2D       The 2D labelmap for this current image.
 * @param  {number} isActiveLabelMap   Whether the labelmap is active.
 *
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
