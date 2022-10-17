import { translate } from './localization/localization.utils';

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

  const suffix = _getLinearMeasurementSuffix(hasPixelSpacing);
  const lengthithSuffix = `${lenght} ${suffix}`;

  if (!displayUncertainties) {
    return lengthithSuffix;
  }

  return `${lengthithSuffix} +/- ${uncertainty} ${suffix}`;
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

  const suffix = _getAreaMeasurmentSuffix(hasPixelSpacing);
  const measuredValueWithSuffix = `${translate('area')}: ${area} ${suffix}`;

  if (!displayUncertainties) {
    return measuredValueWithSuffix;
  }

  return `${measuredValueWithSuffix} +/- ${uncertainty} ${suffix}`;
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

  const suffix = _getLinearMeasurementSuffix(hasPixelSpacing);
  const measuredValueWithSuffix = `${translate(
    'diameter'
  )}: ${diameter} ${suffix}`;

  if (!displayUncertainties) {
    return measuredValueWithSuffix;
  }

  return `${measuredValueWithSuffix} +/- ${uncertainty} ${suffix}`;
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
