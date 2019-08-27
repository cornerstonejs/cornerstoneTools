import eraseIfSegmentIndex from './eraseIfSegmentIndex.js';

/**
 * DrawBrushPixels - Adds or removes labels to a labelmap.
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
  pointerArray,
  labelmap3D,
  imageIdIndex,
  columns,
  shouldErase = false
) {
  const segmentIndex = labelmap3D.activeSegmentIndex;
  const getPixelIndex = (x, y) => y * columns + x;
  const pixelData = labelmap3D.labelmaps2D[imageIdIndex].pixelData;

  pointerArray.forEach(point => {
    const spIndex = getPixelIndex(point[0], point[1]);

    if (shouldErase) {
      eraseIfSegmentIndex(spIndex, pixelData, segmentIndex);
    } else {
      pixelData[spIndex] = segmentIndex;
    }
  });
}

export { drawBrushPixels };
