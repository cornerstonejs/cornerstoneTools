(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function fitToWindowStrategy(eventData) {
        cornerstone.fitToWindow(eventData.element);
    }

    function doubleTapCallback(e, eventData) {
        cornerstoneTools.doubleTapZoom.strategy(eventData);
        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    cornerstoneTools.doubleTapZoom = cornerstoneTools.doubleTapTool(doubleTapCallback);
    cornerstoneTools.doubleTapZoom.strategies = {
        default: fitToWindowStrategy
    };
    cornerstoneTools.doubleTapZoom.strategy = fitToWindowStrategy;

})($, cornerstone, cornerstoneTools);
