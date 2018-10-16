import pointInEllipse from './pointInEllipse.js';

/**
 * Calculates the statistics of an elliptical region of interest.
 * @export @public @method
 * @name calculateEllipseStatistics
 *
 * @param  {number[]} sp    Array of the image data's pixel values.
 * @param  {object} ellipse An object describing the ellipse.
 * @return {object}         The statistics of the ellipse.
 */
export default function (sp, ellipse) {
  // TODO: Get a real statistics library here that supports large counts

  let sum = 0;
  let sumSquared = 0;
  let count = 0;
  let index = 0;

  for (let y = ellipse.top; y < ellipse.top + ellipse.height; y++) {
    for (let x = ellipse.left; x < ellipse.left + ellipse.width; x++) {
      const point = {
        x,
        y
      };

      if (pointInEllipse(ellipse, point)) {
        sum += sp[index];
        sumSquared += sp[index] * sp[index];
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
      stdDev: 0.0
    };
  }

  const mean = sum / count;
  const variance = sumSquared / count - mean * mean;

  return {
    count,
    mean,
    variance,
    stdDev: Math.sqrt(variance)
  };
}
