var cornerstoneTools = (function ($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    if (cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var handleRadius = 6;

    function findHandleNear(element, handles, canvasPoint) {
        for(var property in handles) {
            var handle = handles[property];
            var handleCanvas = cornerstone.pixelToCanvas(element, handle);
            var distance = cornerstoneMath.point.distance(handleCanvas, canvasPoint);
            if (distance <= 36) {
                return handle;
            }
        }
    }

    function getActiveHandle(handles) {
        for(var property in handles) {
            var handle = handles[property];
            if (handle.active === true) {
                return handle;
            }
        }
    }

    function handleActivator(element, handles, canvasPoint) {
        var activeHandle = getActiveHandle(handles);
        var nearbyHandle = findHandleNear(element, handles, canvasPoint);
        if (activeHandle !== nearbyHandle) {
            if (nearbyHandle !== undefined) {
                nearbyHandle.active = true;
            }
            if (activeHandle !== undefined) {
                activeHandle.active = false;
            }
            return true;
        }
        return false;
    }

    // module/private exports
    cornerstoneTools.handleActivator = handleActivator;

    return cornerstoneTools;
}($, cornerstone, cornerstoneMath, cornerstoneTools));