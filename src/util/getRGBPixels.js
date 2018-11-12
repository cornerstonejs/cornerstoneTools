import external from '../externalModules.js';

/**
 * Gets pixels of an RGB image.
 * @export @public @method
 * @name getRGBPixels
 *
 * @param  {HTMLElement} element The element.
 * @param  {number} x       The x position of the top-left corner of the region.
 * @param  {number} y       The y position of the top-left corner of the region.
 * @param  {number} width   The width of the region.
 * @param  {number} height  The height of the region
 * @returns {number[]}       The pixel data.
 */
export default function(element, x, y, width, height) {
  if (!element) {
    throw new Error('getRGBPixels: parameter element must not be undefined');
  }

  x = Math.round(x);
  y = Math.round(y);
  const enabledElement = external.cornerstone.getEnabledElement(element);
  const storedPixelData = [];
  let index = 0;
  const pixelData = enabledElement.image.getPixelData();
  let spIndex, row, column;

  if (enabledElement.image.color) {
    for (row = 0; row < height; row++) {
      for (column = 0; column < width; column++) {
        spIndex = ((row + y) * enabledElement.image.columns + (column + x)) * 4;
        const red = pixelData[spIndex];
        const green = pixelData[spIndex + 1];
        const blue = pixelData[spIndex + 2];
        const alpha = pixelData[spIndex + 3];

        storedPixelData[index++] = red;
        storedPixelData[index++] = green;
        storedPixelData[index++] = blue;
        storedPixelData[index++] = alpha;
      }
    }
  }

  return storedPixelData;
}
