(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function moveNewHandle(mouseEventData, handle, doneMoveCallback, preventHandleOutsideImage) {
        var element = mouseEventData.element;

        function moveCallback(e, eventData) {
            handle.active = true;
            handle.x = eventData.currentPoints.image.x;
            handle.y = eventData.currentPoints.image.y;
            
            if (preventHandleOutsideImage) {
                handle.x = Math.max(handle.x, 0);
                handle.x = Math.min(handle.x, eventData.image.width);

                handle.y = Math.max(handle.y, 0);
                handle.y = Math.min(handle.y, eventData.image.height);
            }

            cornerstone.updateImage(element);
        }

        function whichMovement(e) {
            $(element).off('CornerstoneToolsMouseMove');
            $(element).off('CornerstoneToolsMouseDrag');

            if (e.type === "CornerstoneToolsMouseMove") {
                $(element).on('CornerstoneToolsMouseMove', moveCallback);
                $(element).on('CornerstoneToolsMouseDrag', moveCallback);
                $(element).on('CornerstoneToolsMouseClick', mouseClickCallback);
            } else {
                $(element).on('CornerstoneToolsMouseDrag', moveCallback);
                $(element).on('CornerstoneToolsMouseUp', mouseUpCallback);
            }
        }

        $(element).on('CornerstoneToolsMouseDrag', whichMovement);
        $(element).on('CornerstoneToolsMouseMove', whichMovement);
        
        function mouseUpCallback() {
            handle.active = false;

            $(element).off('CornerstoneToolsMouseDrag');
            $(element).off('CornerstoneToolsMouseUp');

            cornerstone.updateImage(element);

            doneMoveCallback();
        }

        function mouseClickCallback() {
            handle.active = false;

            $(element).off('CornerstoneToolsMouseMove');
            $(element).off('CornerstoneToolsMouseDrag');
            $(element).off('CornerstoneToolsMouseClick');

            cornerstone.updateImage(element);

            doneMoveCallback();
        }
    }

    // module/private exports
    cornerstoneTools.moveNewHandle = moveNewHandle;

})($, cornerstone, cornerstoneTools);
