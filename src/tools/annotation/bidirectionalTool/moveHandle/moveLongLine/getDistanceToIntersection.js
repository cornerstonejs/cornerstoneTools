import getDistanceWithPixelSpacing from '../../utils/getDistanceWithPixelSpacing';

/**
 * Returns the distance between the intersection and the given point
 * considering the row and column pixel spacings.
 *
 * @param {*} baseData Base data for bidirectional line moving
 * @param {*} point Point which the distance to intersection will be calculated
 *
 * @returns {number} Returns the distance betwen the intersection and point
 */
export default function getDistanceToIntersection(baseData, point) {
  const { columnPixelSpacing, rowPixelSpacing, intersection } = baseData;

  return getDistanceWithPixelSpacing(
    columnPixelSpacing,
    rowPixelSpacing,
    point,
    intersection
  );
}
