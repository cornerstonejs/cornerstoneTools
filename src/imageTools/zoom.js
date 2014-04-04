var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }


    /*
     function zoom(element, whichMouseButton){

     if(whichMouseButton == 0) {


     $(element).on('mousewheel DOMMouseScroll', function(e) {

     var startingCoords = cornerstone.pageToImage(element, e.pageX, e.pageY);

     // Firefox e.originalEvent.detail > 0 scroll back, < 0 scroll forward
     // chrome/safari e.originalEvent.wheelDelta < 0 scroll back, > 0 scroll forward
     var ticks = 0;
     var delta = Math.abs(e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta/40 : e.originalEvent.detail ? -e.originalEvent.detail : 0);
     if(e.originalEvent.wheelDelta < 0 || e.originalEvent.detail > 0)
     {
     ticks = delta;
     } else {
     ticks = -delta;
     }

     var power = 1.005;
     var viewport = cornerstone.getViewport(element);
     var oldFactor = Math.log(viewport.scale) / Math.log(power);
     var factor = oldFactor + ticks;
     var scale = Math.pow(power, factor);
     viewport.scale = scale;

     var ee = cornerstone.getEnabledElement(element);
     ee.viewport.scale = scale;

     // now adjust the centerX and Y
     var newCoords = cornerstone.pageToImage(element, e.pageX, e.pageY);
     viewport.centerX -= startingCoords.x - newCoords.x;
     viewport.centerY -= startingCoords.y - newCoords.y;
     cornerstone.setViewport(element, viewport);

     //prevent page fom scrolling
     return false;
     });
     }
     else {

     }

     }
     */


    function onMouseDown(e) {

        var eventData = e.data;
        var element = e.currentTarget;
        if(e.which === eventData.whichMouseButton) {

            var lastX = e.pageX;
            var lastY = e.pageY;

            var startingCoords = cornerstone.pageToImage(element, e.pageX, e.pageY);
            var startPageX = e.pageX;
            var startPageY = e.pageY;
            $(document).mousemove(function(e) {
                var deltaX = e.pageX - lastX,
                    deltaY = e.pageY - lastY ;

                lastX = e.pageX;
                lastY = e.pageY;

                // Calculate the new scale factor based on how far the mouse has changed
                var pow = 1.7;
                var viewport = cornerstone.getViewport(element);
                var ticks = deltaY/100;
                var oldFactor = Math.log(viewport.scale) / Math.log(pow);
                var factor = oldFactor + ticks;
                var scale = Math.pow(pow, factor);
                viewport.scale = scale;
                cornerstone.setViewport(element, viewport);

                // now adjust the centerX and Y so the location the user click when the first started
                // dragging stays in the same position as we zoom
                var newCoords = cornerstone.pageToImage(element, startPageX, startPageY);
                viewport.centerX -= startingCoords.x - newCoords.x;
                viewport.centerY -= startingCoords.y - newCoords.y;
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

    // enables the zoom tool on the specified element.  Note that the zopm tool does nothing
    // in this state as it has no overlays
    function enable(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    // disables the zoom tool on the specified element
    function disable(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    // Activates the zoom tool so it responds to mouse events
    function activate(element, whichMouseButton)
    {
        $(element).unbind('mousedown', onMouseDown);
        var eventData = {
            whichMouseButton: whichMouseButton,
            active: true
        };
        $(element).mousedown(eventData, onMouseDown);
    }

    // deactivates the zoom tool.  This is the same thing as being enabled or disabled as the
    // pan tool requires user interactivity to do anything
    function deactivate(element)
    {
        $(element).unbind('mousedown', onMouseDown);
    }

    // module exports
    cornerstoneTools.zoom = {
        enable: enable,
        disable : disable,
        activate: activate,
        deactivate: deactivate
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));