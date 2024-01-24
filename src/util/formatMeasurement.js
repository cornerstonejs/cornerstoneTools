import { translate, localizeNumber } from './localization/localization.utils';

/**
 *
 *
 * @param {*} lenght
 * @param {*} unit
 * @param {*} uncertainty
 * @param {*} displayUncertainties
 * @returns {string} The formatted label for showing a length
 */
function formatLenght(lenght, unit, uncertainty, displayUncertainties) {
  if (!lenght) {
    return '';
  }

  const localizedLength = localizeNumber(lenght);
  const suffix = translate(unit);
  const lengthWithSuffix = `${localizedLength} ${suffix}`;

  if (!displayUncertainties) {
    return lengthWithSuffix;
  }

  const localizedUncertainty = localizeNumber(uncertainty);

  return `${lengthWithSuffix} +/- ${localizedUncertainty} ${suffix}`;
}

/**
 *
 *
 * @param {*} area
 * @param {*} unit
 * @param {*} uncertainty
 * @param {*} displayUncertainties
 * @returns {string} The formatted label for showing an area
 */
function formatArea(area, unit, uncertainty, displayUncertainties) {
  if (!area) {
    return '';
  }

  const localizedArea = localizeNumber(area);

  const suffix = _getAreaMeasurmentSuffix(unit);
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
 * @param {*} unit
 * @param {*} uncertainty
 * @param {*} displayUncertainties
 * @returns {string} The formatted label for showing a diameter
 */
function formatDiameter(diameter, unit, uncertainty, displayUncertainties) {
  if (!diameter) {
    return '';
  }

  const localizedDiameter = localizeNumber(diameter);

  const suffix = translate(unit);
  const measuredValueWithSuffix = `${translate(
    'diameter'
  )}: ${localizedDiameter} ${suffix}`;

  if (!displayUncertainties) {
    return measuredValueWithSuffix;
  }

  const localizedUncertainty = localizeNumber(uncertainty);

  return `${measuredValueWithSuffix} +/- ${localizedUncertainty} ${suffix}`;
}

function _getAreaMeasurmentSuffix(unit) {
  const squareCharacter = String.fromCharCode(178);
  const preffix = translate(unit);

  return `${preffix}${squareCharacter}`;
}

export { formatArea, formatLenght, formatDiameter };
