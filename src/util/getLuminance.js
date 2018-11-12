import external from '../externalModules.js';

/**
 * Returns the luminance of a region.
 * @public
 * @function getLuminance
 *
 * @param  {HTMLElement} element The element.
 * @param  {number} x       The x position of the top-left corner of the region.
 * @param  {number} y       The y position of the top-left corner of the region.
 * @param  {number} width   The width of the region.
 * @param  {number} height  The height of the region
 * @returns {number[]}         The luminance.
 */
export default function(element, x, y, width, height) {
  if (!element) {
    throw new Error('getLuminance: parameter element must not be undefined');
  }

  x = Math.round(x);
  y = Math.round(y);
  const enabledElement = external.cornerstone.getEnabledElement(element);
  const image = enabledElement.image;
  const luminance = [];
  let index = 0;
  const pixelData = image.getPixelData();
  let spIndex, row, column;

  if (image.color) {
    for (row = 0; row < height; row++) {
      for (column = 0; column < width; column++) {
        spIndex = ((row + y) * image.columns + (column + x)) * 4;
        const red = pixelData[spIndex];
        const green = pixelData[spIndex + 1];
        const blue = pixelData[spIndex + 2];

        luminance[index++] = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
      }
    }
  } else {
    for (row = 0; row < height; row++) {
      for (column = 0; column < width; column++) {
        spIndex = (row + y) * image.columns + (column + x);
        luminance[index++] = pixelData[spIndex] * image.slope + image.intercept;
      }
    }
  }

  return luminance;
}
