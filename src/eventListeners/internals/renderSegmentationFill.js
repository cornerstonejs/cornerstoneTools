import { getModule } from '../../store/index.js';
import { getNewContext, transformCanvasContext } from '../../drawing/index.js';
import external from '../../externalModules';

const segmentationModule = getModule('segmentation');

export default function renderSegmentationFill(
  evt,
  labelmap3D,
  labelmap2D,
  labelmapIndex,
  isActiveLabelMap
) {
  const labelmapCanvas = getLabelmapCanvas(evt, labelmap3D, labelmap2D);

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
 * @returns {HTMLCanvasElement}
 */
export function getLabelmapCanvas(evt, labelmap3D, labelmap2D) {
  const { state } = segmentationModule;
  const eventData = evt.detail;
  const { image } = eventData;
  const cols = image.width;
  const rows = image.height;
  const { segmentsHidden } = labelmap3D;
  const pixelData = labelmap2D.pixelData;
  const colorLutTable = state.colorLutTables[labelmap3D.colorLUTIndex];
  const canvasElement = document.createElement('canvas');

  canvasElement.width = cols;
  canvasElement.height = rows;

  const ctx = getNewContext(canvasElement);

  // Image data initialized with all transparent black.
  const imageData = new ImageData(cols, rows);
  const data = imageData.data;

  for (let i = 0; i < pixelData.length; i++) {
    const segmentIndex = pixelData[i];

    if (segmentIndex !== 0 && !segmentsHidden[segmentIndex]) {
      const color = colorLutTable[pixelData[i]];

      // Modify ImageData.
      data[4 * i] = color[0]; // R value
      data[4 * i + 1] = color[1]; // G value
      data[4 * i + 2] = color[2]; // B value
      data[4 * i + 3] = color[3]; // A value
    }
  }

  // Put this image data onto the labelmapCanvas.
  ctx.putImageData(imageData, 0, 0);

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
  const { configuration } = segmentationModule;
  const eventData = evt.detail;
  const { canvasContext, element, image, viewport } = eventData;

  const previousTransform = canvasContext.getTransform();
  const context = getNewContext(canvasContext.canvas);

  const canvasTopLeft = external.cornerstone.pixelToCanvas(element, {
    x: 0,
    y: 0,
  });

  const canvasTopRight = external.cornerstone.pixelToCanvas(element, {
    x: image.width,
    y: 0,
  });

  const canvasBottomRight = external.cornerstone.pixelToCanvas(element, {
    x: image.width,
    y: image.height,
  });

  const cornerstoneCanvasWidth = external.cornerstoneMath.point.distance(
    canvasTopLeft,
    canvasTopRight
  );
  const cornerstoneCanvasHeight = external.cornerstoneMath.point.distance(
    canvasTopRight,
    canvasBottomRight
  );

  const canvas = canvasContext.canvas;

  const previousImageSmoothingEnabled = context.imageSmoothingEnabled;
  const previousGlobalAlpha = context.globalAlpha;

  context.imageSmoothingEnabled = false;
  context.globalAlpha = isActiveLabelMap
    ? configuration.fillAlpha
    : configuration.fillAlphaInactive;

  transformCanvasContext(context, canvas, viewport);

  const canvasViewportTranslation = getCanvasViewportTranslation(eventData);

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

  context.setTransform(previousTransform);
}

/**
 * GetCanvasViewportTranslation - Returns translation coordinations for
 * canvas viewport with calculation of image row/column pixel spacing.
 *
 * @param  {Object} eventData The data associated with the event.
 * @returns  {Object} The coordinates of the translation.
 */
function getCanvasViewportTranslation(eventData) {
  const { viewport, image } = eventData;

  let widthScale = viewport.scale;
  let heightScale = viewport.scale;

  if (image.rowPixelSpacing < image.columnPixelSpacing) {
    widthScale *= image.columnPixelSpacing / image.rowPixelSpacing;
  } else if (image.columnPixelSpacing < image.rowPixelSpacing) {
    heightScale *= image.rowPixelSpacing / image.columnPixelSpacing;
  }

  return {
    x: viewport.translation.x * widthScale,
    y: viewport.translation.y * heightScale,
  };
}
