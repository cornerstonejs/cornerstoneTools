import pointInFreehandROI from './pointInFreehandROI.js';

const statisticsObj = {
  count: 0,
  mean: 0.0,
  variance: 0.0,
  stdDev: 0.0
};

export default function (sp, boundingBox, dataHandles) {
  let sum = 0;
  let sumSquared = 0;
  let index = 0;

  for (let y = boundingBox.top; y < boundingBox.top + boundingBox.height; y++) {
    for (let x = boundingBox.left; x < boundingBox.left + boundingBox.width; x++) {
      if (pointInFreehandROI(dataHandles, {
        x,
        y
      })) {
        sum += sp[index];
        sumSquared += sp[index] * sp[index];
        statisticsObj.count++;
      }
      index++;
    }
  }

  if (statisticsObj.count === 0) {
    return statisticsObj;
  }

  statisticsObj.mean = sum / statisticsObj.count;
  statisticsObj.variance = sumSquared / statisticsObj.count - statisticsObj.mean * statisticsObj.mean;
  statisticsObj.stdDev = Math.sqrt(statisticsObj.variance);

  return statisticsObj;
}
