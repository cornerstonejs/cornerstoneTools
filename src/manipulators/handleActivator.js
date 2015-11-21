(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    'use strict';

    function getActiveHandle(handles) {
        var activeHandle;

        Object.keys(handles).forEach(function(name) {
            var handle = handles[name];
            if (handle.active === true) {
                activeHandle = handle;
                return;
            }
        });

        return activeHandle;
    }

    function handleActivator(element, handles, canvasPoint, distanceThreshold) {
        if (!distanceThreshold) {
            distanceThreshold = 36;
        }

        var activeHandle = getActiveHandle(handles);
        var nearbyHandle = cornerstoneTools.getHandleNearImagePoint(element, handles, canvasPoint, distanceThreshold);
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

})($, cornerstone, cornerstoneMath, cornerstoneTools);
