import store from '../store/index.js';
import external from '../externalModules.js';
import {
  getNewContext,
  draw,
  drawLines,
  drawJoinedLines,
} from '../drawing/index.js';

import { getLogger } from '../util/logger.js';

const logger = getLogger('eventListeners:onImageRenderedBrushEventHandler');

const { state, configuration, getters } = store.modules.segmentation;

/**
 * Renders segmentation labelmap data associated with this element, with
 * settings defined in the segmentationModules configuration.
 *
 * @param {Object} evt - The cornerstone event.
 * @returns {null}
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

  if (configuration.renderInactiveLabelmaps) {
    renderInactiveLabelMaps(
      evt,
      labelmaps3D,
      activeLabelmapIndex,
      currentImageIdIndex
    );
  }

  renderActiveLabelMap(
    evt,
    labelmaps3D,
    activeLabelmapIndex,
    currentImageIdIndex
  );
}

/**
 * RenderActiveLabelMap - Renders the `Labelmap3D` for this element if a `Labelmap2D`
 *                        view of the `currentImageIdIndex` exists.
 *
 * @param  {Object} evt                 The cornerstone event.
 * @param  {Labelmap3D[]} labelmaps3D       An array of `Labelmap3D` objects.
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
  }
}

/**
 * RenderInactiveLabelMaps - Renders all the inactive `Labelmap3D`s for this element.
 *
 * @param  {Object} evt                 The cornerstone event.
 * @param  {Labelmap3D[]} labelmaps3D       An array of labelmaps.
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
 * RenderSegmentation - Renders the segmentation based on the brush configuration and
 * the active status of the labelmap.
 * @param  {Object} evt                 The cornerstone event.
 * @param  {Labelmap3D} labelmap3D  The `Labelmap3D` object.
 * @param  {number} labelmapIndex The index of the active label map.
 * @param  {Labelmap2D} labelmap2D The `Labelmap2D` object to render.
 * @param  {boolean} isActiveLabelMap Whether or not the labelmap is active.
 * @returns {null}
 */
function renderSegmentation(
  evt,
  labelmap3D,
  labelmapIndex,
  labelmap2D,
  isActiveLabelMap
) {
  if (shouldRenderFill(isActiveLabelMap)) {
    const rects = getRectsToFill(evt, labelmap3D, labelmap2D);

    renderFill(evt, rects, labelmapIndex, isActiveLabelMap);
  }

  if (shouldRenderOutline(isActiveLabelMap)) {
    const outline = getOutline(
      evt,
      labelmap3D,
      labelmap2D,
      configuration.outlineWidth
    );

    renderOutline(evt, outline, labelmapIndex, isActiveLabelMap);
  }
}

/**
 * ShouldRenderFill - Returns true if `configuration.renderFill`
 * is true , and if the global alpha is not zero.
 *
 * @param  {boolean} isActiveLabelMap
 * @returns  {boolean} True if the segmentation should be filled.
 */
function shouldRenderFill(isActiveLabelMap) {
  return (
    configuration.renderFill &&
    ((isActiveLabelMap && configuration.fillAlpha !== 0) ||
      (!isActiveLabelMap && configuration.fillAlphaInactive !== 0))
  );
}

/**
 * ShouldRenderOutline - Returns true if `configuration.renderOutline`
 * is true , and if the global alpha is not zero.
 *
 * @param  {boolean} isActiveLabelMap
 * @returns  {boolean} True if the segmentation should be outlined.
 */
function shouldRenderOutline(isActiveLabelMap) {
  return (
    configuration.renderOutline &&
    ((isActiveLabelMap && configuration.outlineAlpha !== 0) ||
      (!isActiveLabelMap && configuration.outlineAlphaInactive !== 0))
  );
}

/**
 * RenderFill - Renders the filled region of each segment in the segmentation.
 * @param  {Object} evt   The cornerstone event.
 * @param  {Object} rects The rects to fill for each segment index.
 * @param  {Labelmap2D} labelmap2D The `Labelmap2D` object to render.
 * @param  {boolean} isActiveLabelMap Whether or not the labelmap is active.
 * @returns {null}
 */
export function renderFill(evt, rects, labelmapIndex, isActiveLabelMap) {
  const eventData = evt.detail;
  const { element, canvasContext } = eventData;

  const context = getNewContext(canvasContext.canvas);
  const colorMapId = `${state.colorMapId}_${labelmapIndex}`;
  const colorLutTable = state.colorLutTables[colorMapId];

  const previousAlpha = context.globalAlpha;
  const previousImageSmoothingEnabled = context.imageSmoothingEnabled;

  context.globalAlpha = isActiveLabelMap
    ? configuration.fillAlpha
    : configuration.fillAlphaInactive;
  context.imageSmoothingEnabled = false;

  // Render rects
  for (let i = 1; i < rects.length; i++) {
    const rectsI = rects[i];

    if (rectsI) {
      const color = colorLutTable[i];

      const fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]}`;

      for (let r = 0; r < rectsI.length; r++) {
        fillRect(context, rectsI[r], fillStyle, element);
      }
    }
  }

  context.globalAlpha = previousAlpha;
  context.imageSmoothingEnabled = previousImageSmoothingEnabled;
}

export function getRectsToFill(evt, labelmap3D, labelmap2D) {
  const eventData = evt.detail;
  const { image } = eventData;
  const cols = image.width;
  const rows = image.height;

  // Debugger;

  const { segmentsVisible } = labelmap3D;

  const pixelData = labelmap2D.pixelData;
  const activeSegmentIndex = labelmap3D.activeSegmentIndex;
  const rects = [];

  labelmap2D.segmentsOnLabelmap.forEach(segmentIndex => {
    const visible =
      segmentsVisible[segmentIndex] ||
      segmentsVisible[segmentIndex] === undefined;

    if (visible) {
      rects[segmentIndex] = [];
    }
  });

  if (!rects[activeSegmentIndex]) {
    rects[activeSegmentIndex] = [];
  }

  // Scan through each row.
  for (let y = 0; y < rows; y++) {
    // Start at the first pixel, and traverse until you hit a pixel of a different segment.
    let segmentIndex = pixelData[y * rows];
    let start = { x: 0, y };

    // Starts from 1 as checking the next element, up to the last element of the array.
    for (let x = 1; x < cols; x++) {
      const newSegmentIndex = pixelData[y * cols + x];

      if (newSegmentIndex !== segmentIndex) {
        // Hit new segment, save rect.

        const visible =
          segmentsVisible[segmentIndex] ||
          segmentsVisible[segmentIndex] === undefined;

        if (segmentIndex !== 0 && visible) {
          rects[segmentIndex].push({
            start,
            end: { x: x - 1, y },
          });
        }

        // Start scanning rect of index newSegmentIndex.
        start = { x, y };
        segmentIndex = newSegmentIndex;
      }
    }

    // Close off final rect (its fine if start and end are the same value).
    const visible =
      segmentsVisible[segmentIndex] ||
      segmentsVisible[segmentIndex] === undefined;

    if (segmentIndex !== 0 && visible) {
      rects[segmentIndex].push({
        start,
        end: { x: cols - 1, y },
      });
    }
  }

  return rects;
}

/**
 * FillRect - renders the rectangle as a path, as this requires less transformation logic
 * for arbitrary rotations.
 *
 * @param  {CanvasRenderingContext2D} context The canvas context.
 * @param  {Object} rect An object with a start and end pixel to render.
 * @param  {Object} fillStyle The fillstyle. Only property being passed is the color.
 * @param  {HTMLElement} element The cornerstone enabled element.
 */
function fillRect(context, rect, fillStyle, element) {
  const { start, end } = rect;

  const points = [
    {
      x: end.x + 1,
      y: start.y,
    },
    {
      x: end.x + 1,
      y: end.y + 1,
    },
    {
      x: start.x,
      y: end.y + 1,
    },
  ];

  drawJoinedLines(context, element, rect.start, points, {
    fillStyle,
    lineWidth: null,
  });
}

/**
 * RenderOutline - Renders the outlines of segments to the canvas.
 *
 * @param  {Object} evt             The cornerstone event.
 * @param  {Object} outline         The outline to render.
 * @param  {number} labelmapIndex   The index of the labelmap..
 * @param  {number} isActiveLabelMap   Whether the labelmap is active.
 * @returns {null}
 */
export function renderOutline(
  evt,
  outline,
  labelmapIndex,
  isActiveLabelMap = true
) {
  const eventData = evt.detail;
  const { element, canvasContext } = eventData;

  const lineWidth = configuration.outlineWidth || 1;

  const context = getNewContext(canvasContext.canvas);
  const colorMapId = `${state.colorMapId}_${labelmapIndex}`;
  const colorLutTable = state.colorLutTables[colorMapId];

  const previousAlpha = context.globalAlpha;

  context.globalAlpha = isActiveLabelMap
    ? configuration.outlineAlpha
    : configuration.outlineAlphaInactive;

  // Draw outlines.
  draw(context, context => {
    for (let i = 1; i < outline.length; i++) {
      if (outline[i]) {
        const color = colorLutTable[i];

        drawLines(
          context,
          element,
          outline[i],
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
 * GetOutline - Returns an object containing all the line segments to be
 * drawn the canvas.
 *
 * @param  {Object} evt The cornerstone event.
 * @param  {Labelmap3D} labelmap3D The 3D labelmap.
 * @param  {Labelmap2D} labelmap2D The 2D labelmap for this current image.
 * @param  {number} lineWidth The width of the outline in canvas pixels.
 *
 * @returns {Object[][]} An array of arrays of lines for each segment.
 */
export function getOutline(evt, labelmap3D, labelmap2D, lineWidth) {
  const eventData = evt.detail;
  const { element, image, viewport } = eventData;
  const cols = image.width;
  const rows = image.height;

  lineWidth = lineWidth || 1;

  const segmentsVisible = labelmap3D.segmentsVisible;

  const pixelData = labelmap2D.pixelData;
  const activeSegmentIndex = labelmap3D.activeSegmentIndex;
  const lineSegments = [];

  labelmap2D.segmentsOnLabelmap.forEach(segmentIndex => {
    const visible =
      segmentsVisible[segmentIndex] ||
      segmentsVisible[segmentIndex] === undefined;

    if (visible) {
      lineSegments[segmentIndex] = [];
    }
  });

  if (!lineSegments[activeSegmentIndex]) {
    lineSegments[activeSegmentIndex] = [];
  }

  const _getPixelCoordinateFromPixelIndex = pixelIndex => ({
    x: pixelIndex % cols,
    y: Math.floor(pixelIndex / cols),
  });

  const offset = getOutlineOffset(viewport, lineWidth);

  for (let i = 0; i < pixelData.length; i++) {
    const segmentIndex = pixelData[i];

    if (segmentIndex === 0) {
      continue;
    }

    const visible =
      segmentsVisible[segmentIndex] ||
      segmentsVisible[segmentIndex] === undefined;

    if (!visible) {
      continue;
    }

    const coord = _getPixelCoordinateFromPixelIndex(i);
    const pixels = _getPixelIndiciesAroundPixel(coord, rows, cols);

    // Check pixel above
    if (pixels.top === undefined || pixelData[pixels.top] !== segmentIndex) {
      _addTopOutline(lineSegments[segmentIndex], element, coord, offset);
    }

    // Check pixel below
    if (
      pixels.bottom === undefined ||
      pixelData[pixels.bottom] !== segmentIndex
    ) {
      _addBottomOutline(lineSegments[segmentIndex], element, coord, offset);
    }

    // Check pixel to the left
    if (pixels.left === undefined || pixelData[pixels.left] !== segmentIndex) {
      _addLeftOutline(lineSegments[segmentIndex], element, coord, offset);
    }

    // Check pixel to the right
    if (
      pixels.right === undefined ||
      pixelData[pixels.right] !== segmentIndex
    ) {
      _addRightOutline(lineSegments[segmentIndex], element, coord, offset);
    }

    // Top left corner
    if (
      pixels.topLeft !== undefined &&
      pixelData[pixels.topLeft] !== segmentIndex &&
      pixelData[pixels.top] === segmentIndex &&
      pixelData[pixels.left] === segmentIndex
    ) {
      _addTopLeftCorner(lineSegments[segmentIndex], element, coord, offset);
    }

    // Top right corner
    if (
      pixels.topRight !== undefined &&
      pixelData[pixels.topRight] !== segmentIndex &&
      pixelData[pixels.top] === segmentIndex &&
      pixelData[pixels.right] === segmentIndex
    ) {
      _addTopRightCorner(lineSegments[segmentIndex], element, coord, offset);
    }

    // Bottom left corner
    if (
      pixels.bottomLeft !== undefined &&
      pixelData[pixels.bottomLeft] !== segmentIndex &&
      pixelData[pixels.bottom] === segmentIndex &&
      pixelData[pixels.left] === segmentIndex
    ) {
      _addBottomLeftCorner(lineSegments[segmentIndex], element, coord, offset);
    }

    // Bottom right corner
    if (
      pixels.bottomRight !== undefined &&
      pixelData[pixels.bottomRight] !== segmentIndex &&
      pixelData[pixels.bottom] === segmentIndex &&
      pixelData[pixels.right] === segmentIndex
    ) {
      _addBottomRightCorner(lineSegments[segmentIndex], element, coord, offset);
    }
  }

  return lineSegments;
}

/**
 * GetOutlineOffset - Returns the outline offset (half line width) in the
 * i (column) and j (row) pixel directions in the viewport's rotated frame.
 * @param  {Object} viewport The cornerstone viewport.
 * @param  {number} lineWidth The width of the outline.
 * @returns {Object} Two vectors in the i and j pixel directions, with magnitude
 *                   lineWidth / 2
 */
function getOutlineOffset(viewport, lineWidth) {
  const halfLineWidth = lineWidth / 2;
  let theta = viewport.rotation;

  theta *= Math.PI / 180;

  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);

  const unitVectorI = [cosTheta, sinTheta];
  const unitVectorJ = [-sinTheta, cosTheta];

  const i = {
    x: halfLineWidth * unitVectorI[0],
    y: halfLineWidth * unitVectorI[1],
  };

  const j = {
    x: halfLineWidth * unitVectorJ[0],
    y: halfLineWidth * unitVectorJ[1],
  };

  if (viewport.hflip) {
    i.x *= -1;
    i.y *= -1;
  }

  if (viewport.vflip) {
    j.x *= -1;
    j.y *= -1;
  }

  return {
    i,
    j,
  };
}

/**
 * _getPixelIndiciesAroundPixel - Returnns the coordinates for up to 8 surrounding
 * pixels, if they within the bounds of the image.
 *
 * @param  {Object} coord The coordinate to check.
 * @param  {number} rows The number of rows in the image.
 * @param  {number} cols The number of cols in the image.
 *
 * @returns {Object} Object containing the position of adjacent pixels.
 */
function _getPixelIndiciesAroundPixel(coord, rows, cols) {
  const pixelIndex = coord.y * cols + coord.x;
  const pixel = {};

  const hasPixelToTop = coord.y - 1 >= 0;
  const hasPixelToBotoom = coord.y + 1 < rows;
  const hasPixelToLeft = coord.x - 1 >= 0;
  const hasPixelToRight = coord.x + 1 < cols;

  if (hasPixelToTop) {
    pixel.top = pixelIndex - cols;

    if (hasPixelToRight) {
      pixel.topRight = pixel.top + 1;
    }

    if (hasPixelToLeft) {
      pixel.topLeft = pixel.top - 1;
    }
  }

  if (hasPixelToBotoom) {
    pixel.bottom = pixelIndex + cols;

    if (hasPixelToRight) {
      pixel.bottomRight = pixel.bottom + 1;
    }

    if (hasPixelToLeft) {
      pixel.bottomLeft = pixel.bottom - 1;
    }
  }

  if (hasPixelToLeft) {
    pixel.left = pixelIndex - 1;
  }

  if (hasPixelToRight) {
    pixel.right = pixelIndex + 1;
  }

  return pixel;
}

/**
 * _addTopLeftCorner - Adds an outline to the top left corner of the pixel.
 *
 * @param  {Object[]} lineSegmentsForSegment - The list to append.
 * @param  {Object} element - The Cornerstone enabled element.
 * @param  {Object} coord - The pixel to add a line to.
 * @param  {Object} offset - The x and y offset in the rotated frame.
 *
 * @returns {null}
 */
function _addTopLeftCorner(lineSegmentsForSegment, element, coord, offset) {
  const { pixelToCanvas } = external.cornerstone;
  const start = pixelToCanvas(element, coord);

  start.x += offset.j.x;
  start.y += offset.j.y;

  const end = {
    x: start.x,
    y: start.y,
  };

  end.x += offset.i.x * 2;
  end.y += offset.i.y * 2;

  lineSegmentsForSegment.push({
    start,
    end,
  });
}

/**
 * _addTopRightCorner - Adds an outline to the top right corner of the pixel.
 *
 * @param  {Object[]} lineSegmentsForSegment - The list to append.
 * @param  {Object} element - The Cornerstone enabled element.
 * @param  {Object} coord - The pixel to add a line to.
 * @param  {Object} offset - The x and y offset in the rotated frame.
 *
 * @returns {null}
 */
export function _addTopRightCorner(
  lineSegmentsForSegment,
  element,
  coord,
  offset
) {
  const { pixelToCanvas } = external.cornerstone;
  const start = pixelToCanvas(element, { x: coord.x + 1, y: coord.y });

  start.x += offset.j.x;
  start.y += offset.j.y;

  const end = {
    x: start.x,
    y: start.y,
  };

  end.x -= offset.i.x * 2;
  end.y -= offset.i.y * 2;

  lineSegmentsForSegment.push({
    start,
    end,
  });
}

/**
 * _addBottomLeftCorner - Adds an outline to the bottom left corner of the pixel.
 *
 * @param  {Object[]} lineSegmentsForSegment - The list to append.
 * @param  {Object} element - The Cornerstone enabled element.
 * @param  {Object} coord - The pixel to add a line to.
 * @param  {Object} offset - The x and y offset in the rotated frame.
 *
 * @returns {null}
 */
function _addBottomLeftCorner(lineSegmentsForSegment, element, coord, offset) {
  const { pixelToCanvas } = external.cornerstone;
  const start = pixelToCanvas(element, { x: coord.x, y: coord.y + 1 });

  start.x -= offset.j.x;
  start.y -= offset.j.y;

  const end = {
    x: start.x,
    y: start.y,
  };

  end.x += offset.i.x * 2;
  end.y += offset.i.y * 2;

  lineSegmentsForSegment.push({
    start,
    end,
  });
}

/**
 * _addBottomRightCorner - Adds an outline to the bottom right corner of the pixel.
 *
 * @param  {Object[]} lineSegmentsForSegment - The list to append.
 * @param  {Object} element - The Cornerstone enabled element.
 * @param  {Object} coord - The pixel to add a line to.
 * @param  {Object} offset - The x and y offset in the rotated frame.
 *
 * @returns {null}
 */
function _addBottomRightCorner(lineSegmentsForSegment, element, coord, offset) {
  const { pixelToCanvas } = external.cornerstone;
  const start = pixelToCanvas(element, { x: coord.x + 1, y: coord.y + 1 });

  start.x -= offset.j.x;
  start.y -= offset.j.y;

  const end = {
    x: start.x,
    y: start.y,
  };

  end.x -= offset.i.x * 2;
  end.y -= offset.i.y * 2;

  lineSegmentsForSegment.push({
    start,
    end,
  });
}

/**
 * _addTopOutline - adds an outline at the top of the pixel.
 *
 * @param  {Object[]} lineSegmentsForSegment - The list to append.
 * @param  {Object} element - The Cornerstone enabled element.
 * @param  {Object} coord - The pixel to add a line to.
 * @param  {number} halfLineWidth - Half the line width, to place line within the pixel.
 * @param  {Object} offset - The x and y offset in the rotated frame.
 *
 * @returns {null}
 */
function _addTopOutline(lineSegmentsForSegment, element, coord, offset) {
  const { pixelToCanvas } = external.cornerstone;
  const start = pixelToCanvas(element, coord);
  const end = pixelToCanvas(element, { x: coord.x + 1, y: coord.y });

  // Move the line in the y-direction.
  start.x += offset.j.x;
  start.y += offset.j.y;

  end.x += offset.j.x;
  end.y += offset.j.y;

  lineSegmentsForSegment.push({
    start,
    end,
  });
}

/**
 * _addBottomOutline - adds an outline at the bottom of the pixel.
 *
 * @param  {Object[]} lineSegmentsForSegment - The list to append.
 * @param  {Object} element - The Cornerstone enabled element.
 * @param  {Object} coord - The pixel to add a line to.
 * @param  {Object} offset - The x and y offset in the rotated frame.
 *
 * @returns {null}
 */
function _addBottomOutline(lineSegmentsForSegment, element, coord, offset) {
  const { pixelToCanvas } = external.cornerstone;
  const start = pixelToCanvas(element, { x: coord.x, y: coord.y + 1 });
  const end = pixelToCanvas(element, { x: coord.x + 1, y: coord.y + 1 });

  // Move the line in the negative y-direction.
  start.x -= offset.j.x;
  start.y -= offset.j.y;

  end.x -= offset.j.x;
  end.y -= offset.j.y;

  lineSegmentsForSegment.push({
    start,
    end,
  });
}

/**
 * _addLeftOutline - adds an outline at the left side of the pixel.
 *
 * @param  {Object[]} lineSegmentsForSegment - The list to append.
 * @param  {Object} element - The Cornerstone enabled element.
 * @param  {Object} coord - The pixel to add a line to.
 * @param  {Object} offset - The x and y offset in the rotated frame.
 *
 * @returns {null}
 */
function _addLeftOutline(lineSegmentsForSegment, element, coord, offset) {
  const { pixelToCanvas } = external.cornerstone;
  const start = pixelToCanvas(element, coord);
  const end = pixelToCanvas(element, { x: coord.x, y: coord.y + 1 });

  // Move the line in the x-direction.

  start.x += offset.i.x;
  start.y += offset.i.y;

  end.x += offset.i.x;
  end.y += offset.i.y;

  lineSegmentsForSegment.push({
    start,
    end,
  });
}

/**
 * _addRightOutline - adds an outline at the right side of the pixel.
 *
 * @param  {Object[]} lineSegmentsForSegment - The list to append.
 * @param  {Object} element - The Cornerstone enabled element.
 * @param  {Object} coord - The pixel to add a line to.
 * @param  {Object} offset - The x and y offset in the rotated frame.
 *
 * @returns {null}
 */
function _addRightOutline(lineSegmentsForSegment, element, coord, offset) {
  const { pixelToCanvas } = external.cornerstone;
  const start = pixelToCanvas(element, { x: coord.x + 1, y: coord.y });
  const end = pixelToCanvas(element, { x: coord.x + 1, y: coord.y + 1 });

  // Move the line in the negative x-direction.

  start.x -= offset.i.x;
  start.y -= offset.i.y;

  end.x -= offset.i.x;
  end.y -= offset.i.y;

  lineSegmentsForSegment.push({
    start,
    end,
  });
}
