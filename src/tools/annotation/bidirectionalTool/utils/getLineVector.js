/**
 * Return the Vector of a line which determines its inclination and length
 *
 * @param {number} columnPixelSpacing Width that a pixel represents in mm
 * @param {number} rowPixelSpacing Height that a pixel represents in mm
 * @param {*} startPoint Start point of the line
 * @param {*} endPoint End point of the line
 *
 * @returns {*} Resulting line inclination vector
 */
export default function getLineVector(
  columnPixelSpacing,
  rowPixelSpacing,
  startPoint,
  endPoint
) {
  const dx = (startPoint.x - endPoint.x) * columnPixelSpacing;
  const dy = (startPoint.y - endPoint.y) * rowPixelSpacing;
  const length = Math.sqrt(dx * dx + dy * dy);
  const vectorX = dx / length;
  const vectorY = dy / length;

  return {
    x: vectorX,
    y: vectorY,
    length,
  };
}
