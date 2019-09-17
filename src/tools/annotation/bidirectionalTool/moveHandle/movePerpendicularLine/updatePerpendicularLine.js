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
 *
 * @returns {*} Returns a line object with the updated handles position
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

  // Get the object keys for moving and fixed points
  const isMovingStart = movingPoint === perpendicularStart;
  const movingKey = isMovingStart ? 'start' : 'end';
  const fixedKey = isMovingStart ? 'end' : 'start';

  // Calculate and return the new position of the perpendicular handles
  return {
    [movingKey]: {
      x: helperLine.start.x,
      y: helperLine.start.y,
    },
    [fixedKey]: {
      x: mid.x + vector.y * rowPixelSpacing * multiplier,
      y: mid.y + vector.x * columnPixelSpacing * multiplier * -1,
    },
  };
}
