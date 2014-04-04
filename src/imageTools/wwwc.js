var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function onMouseDown(e) {
        var eventData = e.data;
        var element = e.currentTarget;
        if(e.which === eventData.whichMouseButton) {

            var lastX = e.pageX;
            var lastY = e.pageY;

            // now that we started adjusting wwwc, hook mouse move
            // so we can continue to update the image as they drag
            // the mouse
            $(document).mousemove(function(e) {
                var deltaX = e.pageX - lastX;
                var deltaY = e.pageY - lastY;
                lastX = e.pageX;
                lastY = e.pageY;

                // here we normalize the ww/wc adjustments so the same number of on screen pixels
                // adjusts the same percentage of the dynamic range of the image.  This is needed to
                // provide consistency for the ww/wc tool regardless of the dynamic range (e.g. an 8 bit
                // image will feel the same as a 16 bit image would)
                var ee = cornerstone.getEnabledElement(element);
                var imageDynamicRange = ee.image.maxPixelValue - ee.image.minPixelValue;
                var multiplier = imageDynamicRange / 1024;

                var viewport = cornerstone.getViewport(element);
                viewport.windowWidth += (deltaX * multiplier);
                viewport.windowCenter += (deltaY * multiplier);
                cornerstone.setViewport(element, viewport);

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

    // enables the wwwwc tool on the specified element.  Note that the wwwwc tool does nothing
    // in this state as it has no overlays
    function enable(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    // disables the wwwc tool on the specified element
    function disable(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    // Activates the wwwc tool so it responds to mouse events
    function activate(element, whichMouseButton)
    {
        $(element).unbind('mousedown', onMouseDown);
        var eventData = {
            whichMouseButton: whichMouseButton,
            active: true
        };
        $(element).mousedown(eventData, onMouseDown);
    }

    // deactivates the pan tool.  This is the same thing as being enabled or disabled as the
    // pan tool requires user interactivity to do anything
    function deactivate(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    // module exports
    cornerstoneTools.wwwc = {
        enable: enable,
        disable : disable,
        activate: activate,
        deactivate: deactivate
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));