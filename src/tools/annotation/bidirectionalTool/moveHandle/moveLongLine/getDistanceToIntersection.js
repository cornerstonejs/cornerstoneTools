import getDistanceWithPixelSpacing from '../../utils/getDistanceWithPixelSpacing';

/**
 *
 * @param {*} baseData
 * @param {*} point
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
