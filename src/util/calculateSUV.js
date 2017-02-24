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
        var modality = seriesModule.modality;

        // image must be PET
        if (modality !== 'PT') {
            return;
        }

        var modalityPixelValue = storedPixelValue * image.slope + image.intercept;

        var patientWeight = patientStudyModule.patientWeight; // in kg
        if (patientWeight === undefined) {
            return;
        }

        var petSequence = image.data.elements.x00540016;
        if (petSequence === undefined) {
            return;
        }

        petSequence = petSequence.items[0].dataSet;
        var startTime = dicomParser.parseTM(petSequence.string('x00181072'));
        var totalDose = petSequence.floatString('x00181074');
        var halfLife = petSequence.floatString('x00181075');
        var seriesAcquisitionTime = dicomParser.parseTM(image.data.string('x00080031'));

        if (!startTime || !totalDose || !halfLife || !seriesAcquisitionTime) {
            return;
        }

        var acquisitionTimeInSeconds = fracToDec(seriesAcquisitionTime.fractionalSeconds) + seriesAcquisitionTime.seconds + seriesAcquisitionTime.minutes * 60 + seriesAcquisitionTime.hours * 60 * 60;
        var injectionStartTimeInSeconds = fracToDec(startTime.fractionalSeconds) + startTime.seconds + startTime.minutes * 60 + startTime.hours * 60 * 60;
        var durationInSeconds = acquisitionTimeInSeconds - injectionStartTimeInSeconds;
        var correctedDose = totalDose * Math.exp(-durationInSeconds * Math.log(2) / halfLife);
        var suv = modalityPixelValue * patientWeight / correctedDose * 1000;

        return suv;
    }

    // module exports
    cornerstoneTools.calculateSUV = calculateSUV;

})(cornerstoneTools);
