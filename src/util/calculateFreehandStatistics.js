import pointInFreehandROI from './pointInFreehandROI.js';

export default function (sp, boundingBox, dataHandles) {

  let sum = 0;
  let sumSquared = 0;
  let count = 0;
  let index = 0;

  for (let y = boundingBox.top; y < boundingBox.top + boundingBox.height; y++) {
    for (let x = boundingBox.left; x < boundingBox.left + boundingBox.width; x++) {
      const point = {
        x,
        y
      };

      if (pointInFreehandROI(dataHandles, point)) {
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
