import * as cornerstone from 'cornerstone-core';

// Returns a decimal value given a fractional value
function fracToDec (fractionalValue) {
  return parseFloat(`.${fractionalValue}`);
}

export default function (image, storedPixelValue) {
  const patientStudyModule = cornerstone.metaData.get('patientStudyModule', image.imageId);
  const seriesModule = cornerstone.metaData.get('generalSeriesModule', image.imageId);

  if (!patientStudyModule || !seriesModule) {
    return;
  }

  const modality = seriesModule.modality;

    // Image must be PET
  if (modality !== 'PT') {
    return;
  }

  const modalityPixelValue = storedPixelValue * image.slope + image.intercept;

  const patientWeight = patientStudyModule.patientWeight; // In kg

  if (!patientWeight) {
    return;
  }

  const petSequenceModule = cornerstone.metaData.get('petIsotopeModule', image.imageId);

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

  const acquisitionTimeInSeconds = fracToDec(seriesAcquisitionTime.fractionalSeconds || 0) + seriesAcquisitionTime.seconds + seriesAcquisitionTime.minutes * 60 + seriesAcquisitionTime.hours * 60 * 60;
  const injectionStartTimeInSeconds = fracToDec(startTime.fractionalSeconds) + startTime.seconds + startTime.minutes * 60 + startTime.hours * 60 * 60;
  const durationInSeconds = acquisitionTimeInSeconds - injectionStartTimeInSeconds;
  const correctedDose = totalDose * Math.exp(-durationInSeconds * Math.log(2) / halfLife);
  const suv = modalityPixelValue * patientWeight / correctedDose * 1000;

  return suv;
}
