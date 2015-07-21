(function(cornerstoneTools) {

    'use strict';

    function calculateSUV(image, storedPixelValue) {
        // if no dicom data set, return undefined
        if (image.data === undefined) {
            return undefined;
        }
        
        // image must be PET
        if (image.data.string('x00080060') !== 'PT') {
            return undefined;
        }

        var modalityPixelValue = storedPixelValue * image.slope + image.intercept;

        var patientWeight = image.data.floatString('x00101030'); // in kg
        if (patientWeight === undefined) {
            return undefined;
        }

        var petSequence = image.data.elements.x00540016;
        if (petSequence === undefined) {
            return undefined;
        }

        petSequence = petSequence.items[0].dataSet;
        var startTime = petSequence.time('x00181072');
        var totalDose = petSequence.floatString('x00181074');
        var halfLife = petSequence.floatString('x00181075');
        var acquisitionTime = image.data.time('x00080032');
        
        if (!startTime || !totalDose || !halfLife || !acquisitionTime) {
            return undefined;
        }

        var acquisitionTimeInSeconds = acquisitionTime.fractionalSeconds + acquisitionTime.seconds + acquisitionTime.minutes * 60 + acquisitionTime.hours * 60 * 60;
        var injectionStartTimeInSeconds = startTime.fractionalSeconds + startTime.seconds + startTime.minutes * 60 + startTime.hours * 60 * 60;
        var durationInSeconds = acquisitionTimeInSeconds - injectionStartTimeInSeconds;
        var correctedDose = totalDose * Math.exp(-durationInSeconds * Math.log(2) / halfLife);
        var suv = modalityPixelValue * patientWeight / correctedDose * 1000;

        return suv;
    }

    // module exports
    cornerstoneTools.calculateSUV = calculateSUV;

})(cornerstoneTools);
