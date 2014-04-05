var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    /*jshint newcap: false */

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }


    function onDrag(e, onDragCallback)
    {
        var element = e.currentTarget;

        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        var startPageX = touch.pageX;
        var startPageY = touch.pageY;
        var startImagePoint = cornerstone.pageToImage(element, touch.pageX, touch.pageY);
        var startImageX = startImagePoint.x;
        var startImageY = startImagePoint.y;

        var lastPageX = touch.pageX;
        var lastPageY = touch.pageY;
        var lastImageX = startImageX;
        var lastImageY = startImageY;

        $(document).bind('touchmove', function(e) {
            e.preventDefault();
            var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];

            var pageX = touch.pageX;
            var pageY = touch.pageY;
            var currentImagePoint = cornerstone.pageToImage(element, pageX, pageY);
            var deltaImageX = currentImagePoint.x - lastImageX;
            var deltaImageY = currentImagePoint.y - lastImageY;
            var deltaPageX = pageX - lastPageX;
            var deltaPageY = pageY - lastPageY;

            var dragData = {
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
                pageX : pageX,
                pageY : pageY,
                imageX : currentImagePoint.x,
                imageY : currentImagePoint.y,
                viewport: cornerstone.getViewport(element),
                image: cornerstone.getEnabledElement(element).image
            };

            // update the last coordinates for page and image
            lastPageX = pageX;
            lastPageY = pageY;
            lastImageX = currentImagePoint.x;
            lastImageY = currentImagePoint.y;

            // use a timeout to update the viewport so the DOM has time to update itself
            setTimeout(function() {
                onDragCallback(element, dragData);
            }, 1);
        });

        $(document).bind('touchend', function()
        {
            $(document).unbind('touchmove');
            $(document).unbind('touchend');
        });
    }

    function touchDragTool(onDragStart)
    {
        var toolInterface = {
            activate: function(element) {
                $(element).unbind('touchstart', onDragStart);
                $(element).bind('touchstart', onDragStart);
            },
            disable : function(element) {$(element).unbind('touchstart', onDragStart);},
            enable: function(element) {$(element).unbind('touchstart', onDragStart);},
            deactivate: function(element) {$(element).unbind('touchstart', onDragStart);}
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.touchDragTool = touchDragTool;
    cornerstoneTools.onDrag = onDrag;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));