import eraseIfSegmentIndex from './eraseIfSegmentIndex.js';

/**
 * DrawBrushPixels - Adds or removes labels to a labelmap.
 *
 * @param  {number[]} pointerArray      The array of pixels to paint.
 * @param  {Object} labelmap2D          The `Labelmap2D` object to paint to.
 * @param  {number} segmentIndex        The segment being drawn.
 * @param  {number} columns             The number of columns in the image.
 * @param  {boolean} shouldErase = false Whether we should erase rather than color pixels.
 * @returns {null}
 */
function drawBrushPixels(
  pointerArray,
  labelmap2D,
  segmentIndex,
  columns,
  shouldErase = false
) {
  const getPixelIndex = (x, y) => y * columns + x;
  const pixelData = labelmap2D.pixelData;

  pointerArray.forEach(point => {
    const spIndex = getPixelIndex(...point);

    if (shouldErase) {
      eraseIfSegmentIndex(spIndex, pixelData, segmentIndex);
    } else {
      pixelData[spIndex] = segmentIndex;
    }
  });
}

export { drawBrushPixels };
