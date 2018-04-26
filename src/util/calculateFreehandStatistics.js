import pointInFreehandROI from './pointInFreehandROI.js';

export default function (sp, boundingBox, dataHandles) {

  const statisticsObj = {
    count: 0,
    mean: 0.0,
    variance: 0.0,
    stdDev: 0.0
  };

  const sum = getSum(sp, boundingBox, dataHandles);

  if (sum.count === 0) {
    return statisticsObj;
  }

  statisticsObj.count = sum.count;
  statisticsObj.mean = sum.value / sum.count;
  statisticsObj.variance = sum.squared / sum.count - statisticsObj.mean * statisticsObj.mean;
  statisticsObj.stdDev = Math.sqrt(statisticsObj.variance);

  return statisticsObj;
}

function getSum (sp, boundingBox, dataHandles) {
  const sum = {
    value: 0,
    squared: 0,
    count: 0
  };
  let index = 0;
  
  for (let y = boundingBox.top; y < boundingBox.top + boundingBox.height; y++) {
    for (let x = boundingBox.left; x < boundingBox.left + boundingBox.width; x++) {
      if (pointInFreehandROI(dataHandles, {
        x,
        y
      })) {
        sum.value += sp[index];
        sum.squared += sp[index] * sp[index];
        sum.count++;
      }
      index++;
    }
  }

  return sum;
}
