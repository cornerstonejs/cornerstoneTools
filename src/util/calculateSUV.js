import external from '../externalModules.js';

/**
 * Calculates a Standardized Uptake Value.
 * @export @public @method
 * @name calculateSUV
 *
 * @param  {Object} image            The image.
 * @param  {number} storedPixelValue The raw pixel value.
 * @param  {bool} [skipRescale=fale]
 * @returns {number}                  The SUV.
 */
export default function(image, storedPixelValue, skipRescale = false) {
  const cornerstone = external.cornerstone;
  const patientStudyModule = cornerstone.metaData.get(
    'patientStudyModule',
    image.imageId
  );
  const seriesModule = cornerstone.metaData.get(
    'generalSeriesModule',
    image.imageId
  );

  if (!patientStudyModule || !seriesModule) {
    return;
  }

  const modality = seriesModule.modality;

  // Image must be PET
  if (modality !== 'PT') {
    return;
  }

  const modalityPixelValue = skipRescale
    ? storedPixelValue
    : storedPixelValue * image.slope + image.intercept;

  const patientWeight = patientStudyModule.patientWeight; // In kg

  if (!patientWeight) {
    return;
  }

  const petSequenceModule = cornerstone.metaData.get(
    'petIsotopeModule',
    image.imageId
  );

  if (!petSequenceModule) {
    return;
  }

  const radiopharmaceuticalInfo = petSequenceModule.radiopharmaceuticalInfo;
  const startTime = radiopharmaceuticalInfo.radiopharmaceuticalStartTime;
  const totalDose = radiopharmaceuticalInfo.radionuclideTotalDose;
  const halfLife = radiopharmaceuticalInfo.radionuclideHalfLife;
  const seriesAcquisitionTime = seriesModule.seriesTime;

  if (!startTime || !totalDose || !halfLife || !seriesAcquisitionTime) {
    return;
  }

  const acquisitionTimeInSeconds =
    fracToDec(seriesAcquisitionTime.fractionalSeconds || 0) +
    seriesAcquisitionTime.seconds +
    seriesAcquisitionTime.minutes * 60 +
    seriesAcquisitionTime.hours * 60 * 60;
  const injectionStartTimeInSeconds =
    fracToDec(startTime.fractionalSeconds || 0) +
    startTime.seconds +
    startTime.minutes * 60 +
    startTime.hours * 60 * 60;
  const durationInSeconds =
    acquisitionTimeInSeconds - injectionStartTimeInSeconds;
  const correctedDose =
    totalDose * Math.exp((-durationInSeconds * Math.log(2)) / halfLife);
  const suv = ((modalityPixelValue * patientWeight) / correctedDose) * 1000;

  return suv;
}

/**
 * Returns a decimal value given a fractional value.
 * @private
 * @method
 * @name fracToDec
 *
 * @param  {number} fractionalValue The value to convert.
 * @returns {number}                 The value converted to decimal.
 */
function fracToDec(fractionalValue) {
  return parseFloat(`.${fractionalValue}`);
}
