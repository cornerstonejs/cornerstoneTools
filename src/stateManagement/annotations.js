var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // var annotationTypes = ['length', 'angle', 'ellipticalRoi', 'probe', 'rectangleRoi', 'arrow'];

    function getAnnotations() {

        var annotations = cornerstoneTools.globalImageIdSpecificToolStateManager.getToolState();

        if ($.isEmptyObject(annotations)){
            return false;
        }

        // return copy of the object
        return $.extend(true, {}, annotations);
    }

    function setAnnotations(element, annotations) {

        // set annotations by image specific id, must have signature:
        // {
        //  'imageId': {
        //      'toolType': {
        //          data: [annotationDataObject]
        //      }
        //  }
        // }
        
        if (!annotations){
            return false;
        }

        cornerstoneTools.globalImageIdSpecificToolStateManager.setToolState(annotations);

        // update image to show any annotations on the currently displayed image
        if (cornerstone.getEnabledElement(element).image){
            cornerstone.updateImage(element);
        }
    }

    function clearAnnotations(element) {

        cornerstoneTools.globalImageIdSpecificToolStateManager.setToolState({});

        if (cornerstone.getEnabledElement(element).image){
            cornerstone.updateImage(element);
        }
    }

    cornerstoneTools.getAnnotations = getAnnotations;
    cornerstoneTools.setAnnotations = setAnnotations;
    cornerstoneTools.clearAnnotations = clearAnnotations;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));