import { getModule } from '../../store/index.js';
import {
  getNewContext,
  resetCanvasContextTransform,
  transformCanvasContext,
} from '../../drawing/index.js';
import external from '../../externalModules';

const { state, configuration } = getModule('segmentation');

export default function renderSegmentationFill(
  evt,
  labelmap3D,
  labelmap2D,
  labelmapIndex,
  isActiveLabelMap
) {
  const labelmapCanvas = getLabelmapCanvas(
    evt,
    labelmap3D,
    labelmap2D,
    labelmapIndex
  );

  renderFill(evt, labelmapCanvas, isActiveLabelMap);
}

/**
 * Generates a canvas of the `Labelmap2D` data with transparent background, to draw onto the
 * cornerstone canvas. Reduces the number of `putImageData` calls that need to be made by
 * scanning across the labelmap and painting to the canvas in chunks.
 *
 * @param {Object} evt The cornerstone event.
 * @param {Labelmap3D} labelmap3D The `Labelmap3D` object.
 * @param {Labelmap2D} labelmap2D The `Labelmap2D` object containing the pixelData to render.
 * @param {number} labelmapIndex The index of the `Labelmap3D` object.
 * @returns {HTMLCanvasElement}
 */
export function getLabelmapCanvas(evt, labelmap3D, labelmap2D, labelmapIndex) {
  const eventData = evt.detail;
  const { image } = eventData;
  const cols = image.width;
  const rows = image.height;
  const { segmentsVisible } = labelmap3D;
  const pixelData = labelmap2D.pixelData;
  const colorMapId = `${state.colorMapId}_${labelmapIndex}`;
  const colorLutTable = state.colorLutTables[colorMapId];
  const canvasElement = document.createElement('canvas');

  canvasElement.width = cols;
  canvasElement.height = rows;

  const ctx = getNewContext(canvasElement);

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
          // have start and end, putImageData.
          const length = x - start.x;
          const imageData = new ImageData(length, 1);
          const data = imageData.data;

          const color = colorLutTable[segmentIndex];

          // Iterate through every pixel
          for (let i = 0; i < data.length; i += 4) {
            // Modify pixel data
            data[i + 0] = color[0]; // R value
            data[i + 1] = color[1]; // G value
            data[i + 2] = color[2]; // B value
            data[i + 3] = color[3]; // A value
          }

          ctx.putImageData(imageData, start.x, start.y);
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
      // have start and end, putImageData.
      const length = cols - start.x;
      const imageData = new ImageData(length, 1);
      const data = imageData.data;

      const color = colorLutTable[segmentIndex];

      // Iterate through every pixel
      for (let i = 0; i < data.length; i += 4) {
        // Modify pixel data
        data[i + 0] = color[0]; // R value
        data[i + 1] = color[1]; // G value
        data[i + 2] = color[2]; // B value
        data[i + 3] = color[3]; // A value
      }

      ctx.putImageData(imageData, start.x, start.y);
    }
  }

  return canvasElement;
}

/**
 * Renders the filled region of each segment in the segmentation.
 * @param  {Object} evt   The cornerstone event.
 * @param  {HTMLCanvasElement} labelmapCanvas The canvas generated for the labelmap.
 * @param  {boolean} isActiveLabelMap Whether or not the labelmap is active.
 * @returns {null}
 */
export function renderFill(evt, labelmapCanvas, isActiveLabelMap) {
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

  const previousImageSmoothingEnabled = context.imageSmoothingEnabled;
  const previousGlobalAlpha = context.globalAlpha;

  context.imageSmoothingEnabled = false;
  context.globalAlpha = isActiveLabelMap
    ? configuration.fillAlpha
    : configuration.fillAlphaInactive;

  transformCanvasContext(context, canvas, viewport);

  const canvasViewportTranslation = {
    x: viewport.translation.x * viewport.scale,
    y: viewport.translation.y * viewport.scale,
  };

  context.drawImage(
    labelmapCanvas,
    canvas.width / 2 - cornerstoneCanvasWidth / 2 + canvasViewportTranslation.x,
    canvas.height / 2 -
      cornerstoneCanvasHeight / 2 +
      canvasViewportTranslation.y,
    cornerstoneCanvasWidth,
    cornerstoneCanvasHeight
  );

  context.globalAlpha = previousGlobalAlpha;
  context.imageSmoothingEnabled = previousImageSmoothingEnabled;

  resetCanvasContextTransform(context);
}
