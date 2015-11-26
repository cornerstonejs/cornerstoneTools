(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function mouseUpCallback(e, eventData) {
        $(eventData.element).off('CornerstoneToolsMouseDrag', mouseDragCallback);
        $(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
        $(eventData.element).off('CornerstoneToolsMouseClick', mouseUpCallback);
    }

    function mouseDownCallback(e, eventData) {
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {

            var mouseDragEventData = {
                deltaY: 0,
                options: e.data.options
            };
            $(eventData.element).on('CornerstoneToolsMouseDrag', mouseDragEventData, mouseDragCallback);
            $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
            $(eventData.element).on('CornerstoneToolsMouseClick', mouseUpCallback);
            e.stopImmediatePropagation();
            return false;
        }
    }

    function mouseDragCallback(e, eventData) {
        e.data.deltaY += eventData.deltaPoints.page.y;

        var toolData = cornerstoneTools.getToolState(eventData.element, 'timeSeries');
        if (toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
            return;
        }

        var timeSeriesData = toolData.data[0];

        var pixelsPerTimeSeries = $(eventData.element).height() / timeSeriesData.stacks.length ;
        if (e.data.options !== undefined && e.data.options.timeSeriesScrollSpeed !== undefined) {
            pixelsPerTimeSeries = e.data.options.timeSeriesScrollSpeed;
        }

        if (e.data.deltaY >= pixelsPerTimeSeries || e.data.deltaY <= -pixelsPerTimeSeries) {
            var timeSeriesDelta = Math.round(e.data.deltaY / pixelsPerTimeSeries);
            var timeSeriesDeltaMod = e.data.deltaY % pixelsPerTimeSeries;
            cornerstoneTools.incrementTimePoint(eventData.element, timeSeriesDelta);
            e.data.deltaY = timeSeriesDeltaMod;
        }

        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
    }

    function mouseWheelCallback(e, eventData) {
        var images = -eventData.direction;
        cornerstoneTools.incrementTimePoint(eventData.element, images);
    }

    function onDrag(e) {
        var mouseMoveData = e.originalEvent.detail;
        var eventData = {
            deltaY: 0
        };
        eventData.deltaY += mouseMoveData.deltaPoints.page.y;

        var toolData = cornerstoneTools.getToolState(mouseMoveData.element, 'stack');
        if (toolData === undefined || toolData.data === undefined || toolData.data.length === 0) {
            return;
        }

        if (eventData.deltaY >= 3 || eventData.deltaY <= -3) {
            var timeSeriesDelta = eventData.deltaY / 3;
            var timeSeriesDeltaMod = eventData.deltaY % 3;
            cornerstoneTools.setTimePoint(eventData.element, timeSeriesDelta);
            eventData.deltaY = timeSeriesDeltaMod;
        }

        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
    }

    // module/private exports
    cornerstoneTools.timeSeriesScroll = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    cornerstoneTools.timeSeriesScrollWheel = cornerstoneTools.mouseWheelTool(mouseWheelCallback);
    cornerstoneTools.timeSeriesScrollTouchDrag = cornerstoneTools.touchDragTool(onDrag);

})($, cornerstone, cornerstoneTools);
