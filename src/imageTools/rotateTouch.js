var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function touchRotateCallback(e, eventData) {
        eventData.viewport.rotation += eventData.rotation;
        cornerstone.setViewport(eventData.element, eventData.viewport);
        return false;
    }

    function disable(element) {
        $(element).off("CornerstoneToolsTouchRotate", touchRotateCallback);
    }

    function activate(element) {
        $(element).off("CornerstoneToolsTouchRotate", touchRotateCallback);
        $(element).on("CornerstoneToolsTouchRotate", touchRotateCallback);
    }

    cornerstoneTools.rotateTouch = {
        activate: activate,
        disable: disable
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
