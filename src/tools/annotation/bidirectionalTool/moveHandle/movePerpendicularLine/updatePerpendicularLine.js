import getDirectionMultiplier from './getDirectionMultiplier';
import getMovingPoint from './getMovingPoint';

/**
 * Update the opposite handle from the one that is being moved.
 *
 * @param {*} baseData
 * @param {*} mid
 * @param {*} helperLine
 * @param {*} vector
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
