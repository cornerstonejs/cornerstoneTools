/**
 * Return the distance between 2 points considering the pixel spacing
 *
 * @param {number} columnPixelSpacing Width that a pixel represents in mm
 * @param {number} rowPixelSpacing Height that a pixel represents in mm
 * @param {*} startPoint Start point of the line
 * @param {*} endPoint End point of the line
 *
 * @returns {number} Distance between the 2 given points considering the pixel spacing
 */
export default function getDistanceWithPixelSpacing(
  columnPixelSpacing,
  rowPixelSpacing,
  startPoint,
  endPoint
) {
  const calcX = (startPoint.x - endPoint.x) / rowPixelSpacing;
  const calcY = (startPoint.y - endPoint.y) / columnPixelSpacing;

  return Math.sqrt(calcX * calcX + calcY * calcY);
}
