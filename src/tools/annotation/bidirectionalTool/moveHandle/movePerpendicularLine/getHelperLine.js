import getDirectionMultiplier from './getDirectionMultiplier';

/**
 * Creates a helper line with the same inclination as the perpendicular line
 * but having the start point as the proposed point.
 * This line will start in the proposed point and will grow in the long line
 * direction trying to cross it to enable finding the intersection point
 * between the long line and this new perpendicular line.
 *
 * @param {*} baseData Base data for bidirectional line moving
 * @param {*} proposedPoint Point that was moved in bidirectional tool
 * @param {*} vector Vector with the perpendicular line inclination
 *
 * @returns {*} Returns the helper line containing the start and end points
 */
export default function getHelperLine(baseData, proposedPoint, vector) {
  const {
    columnPixelSpacing,
    rowPixelSpacing,
    perpendicularEnd,
    fixedPoint,
  } = baseData;

  // Create a helper line to find the intesection point in the long line
  const highNumber = Number.MAX_SAFE_INTEGER;

  // Get the multiplier
  const multiplier =
    getDirectionMultiplier(fixedPoint, perpendicularEnd) * highNumber;

  return {
    start: proposedPoint,
    end: {
      x: proposedPoint.x + vector.y * rowPixelSpacing * multiplier,
      y: proposedPoint.y + vector.x * columnPixelSpacing * multiplier * -1,
    },
  };
}
