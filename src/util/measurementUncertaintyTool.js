import Decimal from 'decimal.js';

// Daeun: Run node v 14.18.3
/**
 * Custom measurement uncertainly rounding rules.
 * should be refactored after cornerstone update.
 * @param  {number} x           The x position of the textBox.
 * @param  {number} y           The y position of the textBox.
 * @param  {number} radius      Radius of a circle.
 * @param  {number} diameter    Diameter of a circle.
 * @param  {number} area        Area of a cirle or rectangular.
 * @param  {number} dPixel      Pixel diagnoal.
 * @param  {*} pixelSpacing     two pixel spacing values of X and Y.
 * @param  {number} zoomFactor  zoom factor.
 */

// d_Pixel : pixel diagonal used to calculate measurement uncertainty
function pixelDiagonal(pixelSpacing, zoomFactor) {
  return (
    zoomFactor *
    Math.sqrt(
      Math.pow(pixelSpacing.rowPixelSpacing, 2) +
        Math.pow(pixelSpacing.colPixelSpacing, 2)
    )
  );
}

// Distance calculation from two different coordinates
function calculateDistance(x1, x2, y1, y2) {
  const dX = Math.pow(x2 - x1, 2);
  const dY = Math.pow(y2 - y1, 2);

  return Math.sqrt(dX + dY);
}

// Distance calculation by piexel counts
function calculateDistanceWithPixelCounts(x, y, n_x, n_y) {
  const nx = n_x * Math.pow(x, 2);
  const ny = n_y * Math.pow(y, 2);

  return Math.round(Math.sqrt(nx + ny));
}

// Angular calculation between two vectors
function calculateAngle(x, y) {
  const alpha = Math.acos((x * y) / (Math.abs(x) * Math.abs(y)));
  const beta = 180 - alpha;

  return [alpha, beta];
}

/* Rectangular area calculation*/
// const rect_height = calculateDistance(x1, x2, y1, y2);
// const rect_width = calculateDistance(x1, x2, y1, y2);

// function calculateRectangularArea() {
//   return rect_height * rect_width;
// }

// Circle area calculation
function calculateCircleArea(radius) {
  return Math.PI * Math.pow(radius, 2);
}

// Measurement uncertainty: distance

// Measurement uncertainty: distance measurement in pixel counts
function distancePixelCountsMeasurementUncertainty() {
  return Math.sqrt(2);
}

// Measurement uncertainty: angle - NONE

function getCircumference(content) {
  if (!content.diameter) {
    return 2 * content.height + 2 * content.width;
  }

  return Math.PI * 2 * content.radius; // If circle
}

// Measurement uncertainty: Rectangular area
function roiMeasurementUncertainty(circumference, pixelSpacing, zoomFactor) {
  const d_pixel = pixelDiagonal(pixelSpacing, zoomFactor);

  return circumference * d_pixel;
}

/**
 * Rounding
 */

function roundValue(inputValue, uncertaintyValue) {
  console.log(`value: ${inputValue}, uncertainty: ${uncertaintyValue}`);
  const value = new Decimal(inputValue);
  let i = 0;

  // Check if uncertainty is smaller than 1

  if (uncertaintyValue < 1) {
    const belowOne = uncertaintyValue.toString().split('.')[1];
    /**
      Uncertainty rounding measurement rule
      regarding first significant figure:
      if the first significant figure is greater than 2,
      rounding digit stays in the same index.
      However if it is 1 or 2, add one more 0 in the decimal.
      **/

    for (i = 0; i <= belowOne.length; i++) {
      if (belowOne[i] === '0') {
        continue;
      } else if (belowOne[i] === '1' || belowOne[i] === '2') {
        const powerOf = new Decimal(-(i + 2)).abs();
        const decimalPlace = parseInt(powerOf);
        const roundingRange = Decimal.pow(10, powerOf);
        const roundedValue = value.toFixed(decimalPlace);

        console.log(
          `${powerOf} digits, my roundingRange value: ${roundingRange}, rounded: from ${value} to ${roundedValue}`
        );

        return [roundedValue, powerOf];
      } else {
        const powerOf = new Decimal(-(i + 1)).abs();
        const decimalPlace = parseInt(powerOf);
        const roundingRange = Decimal.pow(10, powerOf);
        const roundedValue = value.toFixed(decimalPlace);

        console.log(
          `${powerOf} digits, my roundingRange value: ${roundingRange}, rounded: from ${value} to ${roundedValue}`
        );

        return [roundedValue, powerOf];
      }
    }
  } else {
    // When the value is larger than 1
    const aboveOne = uncertaintyValue.toString().split('.')[0];

    if (aboveOne[0] === '1' || aboveOne[0] === '2') {
      const powerOf = aboveOne.length - 2;
      const roundingRange = Decimal.pow(10, powerOf);
      const roundedValue = new Decimal(value).toNearest(roundingRange);

      console.log(
        `${powerOf} digits, roundingRange: ${roundingRange}, rounded value is from ${value} to ${roundedValue}`
      );

      return [roundedValue, Decimal.abs(powerOf)];
    }
    const powerOf = aboveOne.length - 1;
    const roundingRange = Decimal.pow(10, powerOf);
    const roundedValue = new Decimal(value).toNearest(roundingRange);

    console.log(
      `${powerOf} digits, roundingRange: ${roundingRange}, rounded value is from ${value} to ${roundedValue}`
    );

    return [roundedValue, Decimal.abs(powerOf)];
  }
}

export {
  pixelDiagonal,
  calculateDistance,
  calculateDistanceWithPixelCounts,
  calculateAngle,
  // CalculateRectangularArea,
  calculateCircleArea,
  distancePixelCountsMeasurementUncertainty,
  getCircumference,
  roiMeasurementUncertainty,
  roundValue,
};
