var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function onMouseDown(e){
        var eventData = e.data;
        var element = e.currentTarget;
        if(e.which === eventData.whichMouseButton) {

            var lastX = e.pageX;
            var lastY = e.pageY;

            // now that we have started panning, hook mousemove so
            // we can update the image as they drag
            $(document).mousemove(function(e) {
                var deltaX = e.pageX - lastX,
                    deltaY = e.pageY - lastY ;
                lastX = e.pageX;
                lastY = e.pageY;

                var viewport = cornerstone.getViewport(element);
                viewport.centerX += (deltaX / viewport.scale);
                viewport.centerY += (deltaY / viewport.scale);
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

    // enables the pan tool on the specified element.  Note that the pan tool does nothing
    // in this state as it has no overlays
    function enable(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    // disables the pan tool on the specified element
    function disable(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    // Activates the pan tool so it responds to mouse events
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
    cornerstoneTools.pan = {
        enable: enable,
        disable : disable,
        activate: activate,
        deactivate: deactivate
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));