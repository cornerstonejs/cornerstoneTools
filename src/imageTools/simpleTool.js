var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function onMouseDown(e) {

        var eventData = e.data;

        if(e.which === eventData.whichMouseButton) {

            var element = e.currentTarget;

            var startPageX = e.pageX;
            var startPageY = e.pageY;
            var startImagePoint = cornerstone.pageToImage(element, e.pageX, e.pageY);
            var startImageX = startImagePoint.x;
            var startImageY = startImagePoint.y;

            var lastPageX = e.pageX;
            var lastPageY = e.pageY;
            var lastImageX = startImageX;
            var lastImageY = startImageY;

            $(document).mousemove(function(e) {
                // Calculate delta values in page and image coordinates
                var deltaPageX = e.pageX - lastPageX;
                var deltaPageY = e.pageY - lastPageY;
                var currentImagePoint = cornerstone.pageToImage(element, e.pageX, e.pageY);
                var deltaImageX = currentImagePoint.x - lastImageX;
                var deltaImageY = currentImagePoint.y - lastImageY;

                // create an object with all the data they might need
                var mouseMoveData = {
                    startPageX : startPageX,
                    startPageY : startPageY,
                    startImageX : startImageX,
                    startImageY : startImageY,
                    lastPageX : lastPageX,
                    lastPageY : lastPageY,
                    lastImageX : lastImageX,
                    lastImageY : lastImageY,
                    deltaPageX : deltaPageX,
                    deltaPageY : deltaPageY,
                    deltaImageX : deltaImageX,
                    deltaImageY : deltaImageY,
                    pageX : e.pageX,
                    pageY : e.pageY,
                    imageX : currentImagePoint.x,
                    imageY : currentImagePoint.y,
                };

                // invoke the mouseMoveCallback with the data
                eventData.mouseMoveCallback(element, mouseMoveData);

                // update the last coordinates for page and image
                lastPageX = e.pageX;
                lastPageY = e.pageY;
                lastImageX = currentImagePoint.x;
                lastImageY = currentImagePoint.y;

                // prevent left click selection of DOM elements
                return cornerstoneTools.pauseEvent(e);
            });

            // hook mouseup so we can unbind our event listeners
            // when they stop dragging
            $(document).mouseup(function(e) {
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
            });

            // prevent left click selection of DOM elements
            return cornerstoneTools.pauseEvent(e);
        }
    }

    function unbind(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    function makeSimpleTool(mouseMoveCallback)
    {
        var toolInterface = {
            activate: function(element, whichMouseButton) {
                $(element).unbind('mousedown', onMouseDown);
                var eventData = {
                    whichMouseButton: whichMouseButton,
                    active: true,
                    mouseMoveCallback: mouseMoveCallback
                };
                $(element).mousedown(eventData, onMouseDown);
            },
            disable : unbind,
            enable: unbind,
            deactivate: unbind
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.makeSimpleTool = makeSimpleTool;


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));