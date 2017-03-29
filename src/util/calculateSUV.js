(function(cornerstoneTools) {

    'use strict';

    // Returns a decimal value given a fractional value
    function fracToDec(fractionalValue) {
        return parseFloat('.' + fractionalValue);
    }

    function calculateSUV(image, storedPixelValue) {
        if (!dicomParser) {
            return;
        }

        var patientStudyModule = cornerstone.metaData.get('patientStudyModule', image.imageId);
        var seriesModule = cornerstone.metaData.get('generalSeriesModule', image.imageId);
        if (!patientStudyModule || !seriesModule) {
            return;
        }

        var modality = seriesModule.modality;

        // image must be PET
        if (modality !== 'PT') {
            return;
        }

        var modalityPixelValue = storedPixelValue * image.slope + image.intercept;

        var patientWeight = patientStudyModule.patientWeight; // in kg
        if (!patientWeight) {
            return;
        }

        var petSequenceModule = cornerstone.metaData.get('petIsotopeModule', image.imageId);
        if (!petSequenceModule) {
            return;
        }

        var radiopharmaceuticalInfo = petSequenceModule.radiopharmaceuticalInfo;
        var startTime = radiopharmaceuticalInfo.radiopharmaceuticalStartTime;
        var totalDose = radiopharmaceuticalInfo.radionuclideTotalDose;
        var halfLife = radiopharmaceuticalInfo.radionuclideHalfLife;
        var seriesAcquisitionTime = seriesModule.seriesTime;

        if (!startTime || !totalDose || !halfLife || !seriesAcquisitionTime) {
            return;
        }

        var acquisitionTimeInSeconds = fracToDec(seriesAcquisitionTime.fractionalSeconds || 0) + seriesAcquisitionTime.seconds + seriesAcquisitionTime.minutes * 60 + seriesAcquisitionTime.hours * 60 * 60;
        var injectionStartTimeInSeconds = fracToDec(startTime.fractionalSeconds) + startTime.seconds + startTime.minutes * 60 + startTime.hours * 60 * 60;
        var durationInSeconds = acquisitionTimeInSeconds - injectionStartTimeInSeconds;
        var correctedDose = totalDose * Math.exp(-durationInSeconds * Math.log(2) / halfLife);
        var suv = modalityPixelValue * patientWeight / correctedDose * 1000;

        return suv;
    }

    // module exports
    cornerstoneTools.calculateSUV = calculateSUV;

})(cornerstoneTools);
