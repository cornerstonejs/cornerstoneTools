import pointInFreehand from './pointInFreehand.js';

/**
 * Calculates the statistics of all the pixels within the freehand object.
 * @export @public @method
 * @name calculateFreehandStatistics
 *
 * @param {Object} sp An array of the pixel data.
 * @param {Object} boundingBox Rectangular box enclosing the polygon.
 * @param {Object} dataHandles Data object associated with the tool.
 * @returns {Object} Object containing the derived statistics.
 */
export default function(sp, boundingBox, dataHandles) {
  const statisticsObj = {
    count: 0,
    mean: 0.0,
    variance: 0.0,
    stdDev: 0.0,
  };

  const sum = getSum(sp, boundingBox, dataHandles);

  if (sum.count === 0) {
    return statisticsObj;
  }

  statisticsObj.count = sum.count;
  statisticsObj.mean = sum.value / sum.count;
  statisticsObj.variance =
    sum.squared / sum.count - statisticsObj.mean * statisticsObj.mean;
  statisticsObj.stdDev = Math.sqrt(statisticsObj.variance);

  return statisticsObj;
}

/**
 * Calculates the sum, squared sum and count of all pixels within the polygon.
 * @private
 * @method
 * @name getSum
 *
 * @param {Object} sp An array of the pixel data.
 * @param {Object} boundingBox Rectangular box enclosing the polygon.
 * @param {Object} dataHandles Data object associated with the tool.
 * @returns {Object} Object containing the sum, squared sum and pixel count.
 */
function getSum(sp, boundingBox, dataHandles) {
  const sum = {
    value: 0,
    squared: 0,
    count: 0,
  };
  let index = 0;

  for (let y = boundingBox.top; y < boundingBox.top + boundingBox.height; y++) {
    for (
      let x = boundingBox.left;
      x < boundingBox.left + boundingBox.width;
      x++
    ) {
      const point = {
        x,
        y,
      };

      sumPointIfInFreehand(dataHandles, point, sum, sp[index]);
      index++;
    }
  }

  return sum;
}

/**
 * Adds the pixel to the workingSum if it is within the polygon.
 * @private
 * @method sumPointIfInFreehand
 *
 * @param {Object} dataHandles Data object associated with the tool.
 * @param {Object} point The pixel coordinates.
 * @param {Object} workingSum The working sum, squared sum and pixel count.
 * @param {Object} pixelValue The pixel value. // @modifies {workingSum}
 * @returns {undefined}
 */
function sumPointIfInFreehand(dataHandles, point, workingSum, pixelValue) {
  if (pointInFreehand(dataHandles, point)) {
    workingSum.value += pixelValue;
    workingSum.squared += pixelValue * pixelValue;
    workingSum.count++;
  }
}
