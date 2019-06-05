import external from '../../externalModules.js';
import EVENTS from '../../events.js';
import { draw, fillBox } from '../../drawing/index.js';

/**
 * drawBrushPixels - Adds or removes labels to a labelmap.
 *
 * @param  {number[]} pointerArray      The array of points to draw.
 * @param  {Object} labelmap3D          The labelmap to modify.
 * @param  {number} imageIdIndex        The index of the image in the stack.
 * @param  {number} segmentIndex        The segment being drawn.
 * @param  {number} columns             The number of columns in the image.
 * @param  {boolean} shouldErase = false Whether we should erase rather than color pixels.
 * @returns {null}
 */
function drawBrushPixels(
  element,
  pointerArray,
  labelmap3D,
  imageIdIndex,
  segmentIndex,
  columns,
  shouldErase = false
) {
  const getPixelIndex = (x, y) => y * columns + x;
  const pixelData = labelmap3D.labelmaps2D[imageIdIndex].pixelData;

  pointerArray.forEach(point => {
    const spIndex = getPixelIndex(point[0], point[1]);

    if (shouldErase) {
      if (pixelData[spIndex] === segmentIndex) {
        pixelData[spIndex] = 0;
      }
    } else {
      pixelData[spIndex] = segmentIndex;
    }
  });

  labelmap3D.labelmaps2D[imageIdIndex].invalidated = true;

  if (shouldErase && pixelData.some(element => !element)) {
    delete labelmap3D.labelmaps2D[imageIdIndex];
  }

  external.cornerstone.triggerEvent(element, EVENTS.LABELMAP_MODIFIED, {
    labelmapIndex,
  });
}

export { drawBrushPixels };
