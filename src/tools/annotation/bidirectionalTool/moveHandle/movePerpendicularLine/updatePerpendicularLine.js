import getDirectionMultiplier from './getDirectionMultiplier';
import getMovingPoint from './getMovingPoint';

/**
 * Returns the updated line object that will be used to change the position of
 * the perpendicular line handles.
 *
 * @param {*} baseData Base data for bidirectional line moving
 * @param {*} mid Middle point considering the proposed point
 * @param {*} helperLine Line based on proposed point that crosses long line
 * @param {*} vector Vector with the perpendicular line inclination
 */
export default function updatePerpendicularLine(
  baseData,
  mid,
  helperLine,
  vector
) {
  const {
    columnPixelSpacing,
    rowPixelSpacing,
    fixedPoint,
    perpendicularStart,
    perpendicularEnd,
    distanceToFixed,
  } = baseData;

  // Get the multiplier
  const multiplier =
    getDirectionMultiplier(fixedPoint, perpendicularEnd) * distanceToFixed;

  // Define the moving point
  const movingPoint = getMovingPoint(
    fixedPoint,
    perpendicularStart,
    perpendicularEnd
  );

  // Change the position of the perpendicular line handles
  movingPoint.x = helperLine.start.x;
  movingPoint.y = helperLine.start.y;
  fixedPoint.x = mid.x + vector.y * rowPixelSpacing * multiplier;
  fixedPoint.y = mid.y + vector.x * columnPixelSpacing * multiplier * -1;
}
