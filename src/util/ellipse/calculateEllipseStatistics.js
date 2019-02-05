import pointInEllipse from './pointInEllipse.js';

/**
 * Calculates the statistics of an elliptical region of interest.
 *
 * @private
 * @function calculateEllipseStatistics
 *
 * @param {number[]} sp - Array of the image data's pixel values.
 * @param {Object} ellipse - { top, left, height, width } - An object describing the ellipse.
 * @returns {Object} { count, mean, variance, stdDev, min, max }
 */
export default function(sp, ellipse) {
  let sum = 0;
  let sumSquared = 0;
  let count = 0;
  let index = 0;
  let min = null;
  let max = null;

  for (let y = ellipse.top; y < ellipse.top + ellipse.height; y++) {
    for (let x = ellipse.left; x < ellipse.left + ellipse.width; x++) {
      const point = {
        x,
        y,
      };

      if (pointInEllipse(ellipse, point)) {
        if (min === null) {
          min = sp[index];
          max = sp[index];
        }

        sum += sp[index];
        sumSquared += sp[index] * sp[index];
        min = Math.min(min, sp[index]);
        max = Math.max(max, sp[index]);
        count++;
      }

      index++;
    }
  }

  if (count === 0) {
    return {
      count,
      mean: 0.0,
      variance: 0.0,
      stdDev: 0.0,
      min: 0.0,
      max: 0.0,
    };
  }

  const mean = sum / count;
  const variance = sumSquared / count - mean * mean;

  return {
    count,
    mean,
    variance,
    stdDev: Math.sqrt(variance),
    min,
    max,
  };
}
