import external from './../../externalModules.js';
import calculateSUV from '../../util/calculateSUV.js';
import calculateFreehandStatistics from './calculateFreehandStatistics';
import getImageModality from './getImageModality';

/**
 * Calculates the mean standard deviation and mean standard deviation SUV - if
 * the image is a PET scan - of all the pixels within the freehand object.
 * @export @public @method
 * @name calculateMeanStdDev
 *
 * @param {Object} element The element containing the image
 * @param {Object} image The image
 * @param {Object} polyBoundingBox Rectangular box enclosing the pixels we care about
 * @param {Object[]} points The data handles use to calculate the mean standard deviation
 * @returns {Object} Object containing the mean standard deviation and mean standard deviation SUV.
 */
function calculateMeanStdDev({ element, image, polyBoundingBox, points }) {
  const { intercept, slope } = image;
  const modality = getImageModality(image);
  // Retrieve the array of pixels that the ROI bounds cover
  const pixels = external.cornerstone.getPixels(
    element,
    polyBoundingBox.left,
    polyBoundingBox.top,
    polyBoundingBox.width,
    polyBoundingBox.height
  );
  // Calculate the mean & standard deviation from the pixels and the object shape
  const meanStdDev = calculateFreehandStatistics.call(
    this,
    pixels,
    polyBoundingBox,
    points
  );
  let meanStdDevSUV;

  if (modality === 'PT') {
    // If the image is from a PET scan, use the DICOM tags to
    // Calculate the SUV from the mean and standard deviation.

    // Note that because we are using modality pixel values from getPixels, and
    // The calculateSUV routine also rescales to modality pixel values, we are first
    // Returning the values to storedPixel values before calcuating SUV with them.
    // TODO: Clean this up? Should we add an option to not scale in calculateSUV?
    meanStdDevSUV = {
      mean: calculateSUV(image, (meanStdDev.mean - intercept) / slope),
      stdDev: calculateSUV(image, (meanStdDev.stdDev - intercept) / slope),
    };
  }

  return {
    meanStdDev,
    meanStdDevSUV,
  };
}

export default calculateMeanStdDev;
