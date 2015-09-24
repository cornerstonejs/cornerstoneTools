(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function touchPanCallback(e, eventData) {
        eventData.viewport.translation.x += (eventData.deltaPoints.page.x / eventData.viewport.scale);
        eventData.viewport.translation.y += (eventData.deltaPoints.page.y / eventData.viewport.scale);
        cornerstone.setViewport(eventData.element, eventData.viewport);
        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    function disable(element) {
        $(element).off('CornerstoneToolsMultiTouchDrag', touchPanCallback);
    }

    function activate(element) {
        $(element).off('CornerstoneToolsMultiTouchDrag', touchPanCallback);
        $(element).on('CornerstoneToolsMultiTouchDrag', touchPanCallback);
    }

    cornerstoneTools.panMultiTouch = {
        activate: activate,
        disable: disable
    };

})($, cornerstone, cornerstoneTools);
