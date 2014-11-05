var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var annotationTypes = ['length', 'angle', 'ellipticalRoi', 'probe', 'rectangleRoi', 'arrow'];

    function getAnnotations(element) {
        
        var annotations = {};

        // get all current annotations for the element
        $.each(annotationTypes, function(index, type){

            var toolState = cornerstoneTools.getToolState(element, type);

            if (toolState && toolState.data && toolState.data.length > 0){

                // perform deep copy of array
                annotations[type] = $.extend(true, [], toolState.data);
            }
        });

        return annotations;
    }

    function setAnnotations(element, annotations) {

        // set annotations by type, must have signature:
        // {
        //  'toolType': [annotationData]
        // }
        
        if (!annotations){
            return false;
        }

        // loop through annotation types
        $.each(annotations, function(type, annotationArray){

            if (annotationTypes.indexOf(type) > -1 && annotationArray.length > 0){

                // loop through individual annotations for each type and add them
                $.each(annotationArray, function(index, annotation){

                    cornerstoneTools.addToolState(element, type, annotation);
                });
            }
        });

        // update image to show any annotations on the currently displayed image
        cornerstone.updateImage(element);
    }

    function clearAnnotations(element) {

        // get each annotation type, wipe it out
        $.each(annotationTypes, function(index, type){

            var toolState = cornerstoneTools.getToolState(element, type);

            if (toolState && toolState.data && toolState.data.length > 0){

                // empty array
                toolState.data.length = 0;
            }
        });

        cornerstone.updateImage(element);
    }

    cornerstoneTools.getAnnotations = getAnnotations;
    cornerstoneTools.setAnnotations = setAnnotations;
    cornerstoneTools.clearAnnotations = clearAnnotations;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));