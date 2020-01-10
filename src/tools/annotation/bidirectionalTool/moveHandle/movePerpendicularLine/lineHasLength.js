import getDistanceWithPixelSpacing from '../../utils/getDistanceWithPixelSpacing';

/**
 * Returns true if the given line object has its length different from zero,
 * considering the column and row pixel spacings.
 *
 * @param {number} columnPixelSpacing Width that a pixel represents in mm
 * @param {number} rowPixelSpacing Height that a pixel represents in mm
 * @param {*} line Line object that will have its length calculated
 *
 * @returns {boolean} Returns true if line has any length
 */
export default function lineHasLength(
  columnPixelSpacing,
  rowPixelSpacing,
  line
) {
  const lineLength = getDistanceWithPixelSpacing(
    columnPixelSpacing,
    rowPixelSpacing,
    line.start,
    line.end
  );

  return lineLength !== 0;
}
