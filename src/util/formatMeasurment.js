import { translate, localizeNumber } from './localization/localization.utils';

/**
 *
 *
 * @param {*} lenght
 * @param {*} hasPixelSpacing
 * @param {*} uncertainty
 * @param {*} displayUncertainties
 * @returns {string} The formatted label for showing a length
 */
function formatLenght(
  lenght,
  hasPixelSpacing,
  uncertainty,
  displayUncertainties
) {
  if (!lenght) {
    return '';
  }

  const localizedLength = localizeNumber(lenght);
  const suffix = _getLinearMeasurementSuffix(hasPixelSpacing);
  const lengthithSuffix = `${localizedLength} ${suffix}`;

  if (!displayUncertainties) {
    return lengthithSuffix;
  }

  const localizedUncertainty = localizeNumber(uncertainty);

  return `${lengthithSuffix} +/- ${localizedUncertainty} ${suffix}`;
}

/**
 *
 *
 * @param {*} area
 * @param {*} hasPixelSpacing
 * @param {*} uncertainty
 * @param {*} displayUncertainties
 * @returns {string} The formatted label for showing an area
 */
function formatArea(area, hasPixelSpacing, uncertainty, displayUncertainties) {
  if (!area) {
    return '';
  }

  const localizedArea = localizeNumber(area);

  const suffix = _getAreaMeasurmentSuffix(hasPixelSpacing);
  const measuredValueWithSuffix = `${translate(
    'area'
  )}: ${localizedArea} ${suffix}`;

  if (!displayUncertainties) {
    return measuredValueWithSuffix;
  }

  const localizedUncertainty = localizeNumber(uncertainty);

  return `${measuredValueWithSuffix} +/- ${localizedUncertainty} ${suffix}`;
}

/**
 *
 *
 * @param {*} diameter
 * @param {*} hasPixelSpacing
 * @param {*} uncertainty
 * @param {*} displayUncertainties
 * @returns {string} The formatted label for showing a diameter
 */
function formatDiameter(
  diameter,
  hasPixelSpacing,
  uncertainty,
  displayUncertainties
) {
  if (!diameter) {
    return '';
  }

  const localizedDiameter = localizeNumber(diameter);

  const suffix = _getLinearMeasurementSuffix(hasPixelSpacing);
  const measuredValueWithSuffix = `${translate(
    'diameter'
  )}: ${localizedDiameter} ${suffix}`;

  if (!displayUncertainties) {
    return measuredValueWithSuffix;
  }

  const localizedUncertainty = localizeNumber(uncertainty);

  return `${measuredValueWithSuffix} +/- ${localizedUncertainty} ${suffix}`;
}

export { formatArea, formatLenght, formatDiameter };

function _getAreaMeasurmentSuffix(hasPixelSpacing) {
  const squareCharacter = String.fromCharCode(178);
  const preffix = _getLinearMeasurementSuffix(hasPixelSpacing);

  return `${preffix}${squareCharacter}`;
}

function _getLinearMeasurementSuffix(hasPixelSpacing) {
  return hasPixelSpacing ? 'mm' : 'pix';
}
