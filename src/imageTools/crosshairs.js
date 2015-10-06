(function($, cornerstone, cornerstoneTools) {

    'use strict';

    var toolType = 'crosshairs';

    function chooseLocation(e, eventData) {
        // if we have no toolData for this element, return immediately as there is nothing to do
        var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);
        if (!toolData) {
            return;
        }

        // Get current element target information
        var sourceElement = e.currentTarget;
        var sourceEnabledElement = cornerstone.getEnabledElement(sourceElement);
        var sourceImageId = sourceEnabledElement.image.imageId;
        var sourceImagePlane = cornerstoneTools.metaData.get('imagePlane', sourceImageId);

        // Get currentPoints from mouse cursor on selected element
        var sourceImagePoint = eventData.currentPoints.image;

        // Transfer this to a patientPoint given imagePlane metadata
        var patientPoint = cornerstoneTools.imagePointToPatientPoint(sourceImagePoint, sourceImagePlane);

        // Get the enabled elements associated with this synchronization context
        var syncContext = toolData.data[0].synchronizationContext;
        var enabledElements = syncContext.getSourceElements();

        // Iterate over each synchronized element
        $.each(enabledElements, function(index, targetElement) {
            // don't do anything if the target is the same as the source
            if (targetElement === sourceElement) {
                return; // Same as 'continue' in a normal for loop
            }

            var minDistance = Number.MAX_VALUE;
            var newImageIdIndex = -1;

            var stackToolDataSource = cornerstoneTools.getToolState(targetElement, 'stack');
            if (stackToolDataSource === undefined) {
                return; // Same as 'continue' in a normal for loop
            }

            var stackData = stackToolDataSource.data[0];

            // Find within the element's stack the closest image plane to selected location
            $.each(stackData.imageIds, function(index, imageId) {
                var imagePlane = cornerstoneTools.metaData.get('imagePlane', imageId);
                var imagePosition = imagePlane.imagePositionPatient;
                var row = imagePlane.rowCosines.clone();
                var column = imagePlane.columnCosines.clone();
                var normal = column.clone().cross(row.clone());
                var distance = Math.abs(normal.clone().dot(imagePosition) - normal.clone().dot(patientPoint));
                //console.log(index + '=' + distance);
                if (distance < minDistance) {
                    minDistance = distance;
                    newImageIdIndex = index;
                }
            });

            if (newImageIdIndex === stackData.currentImageIdIndex) {
                return;
            }

            // Switch the loaded image to the required image
            if (newImageIdIndex !== -1 && stackData.imageIds[newImageIdIndex] !== undefined) {
                var startLoadingHandler = cornerstoneTools.loadHandlerManager.getStartLoadHandler();
                var endLoadingHandler = cornerstoneTools.loadHandlerManager.getEndLoadHandler();
                var errorLoadingHandler = cornerstoneTools.loadHandlerManager.getErrorLoadingHandler();

                if (startLoadingHandler) {
                    startLoadingHandler(targetElement);
                }

                cornerstone.loadAndCacheImage(stackData.imageIds[newImageIdIndex]).then(function(image) {
                    var viewport = cornerstone.getViewport(targetElement);
                    stackData.currentImageIdIndex = newImageIdIndex;
                    cornerstone.displayImage(targetElement, image, viewport);
                    if (endLoadingHandler) {
                        endLoadingHandler(targetElement);
                    }
                }, function(error) {
                    var imageId = stackData.imageIds[newImageIdIndex];
                    if (errorLoadingHandler) {
                        errorLoadingHandler(targetElement, imageId, error);
                    }
                });
            }
        });
    }

    function mouseUpCallback(e, eventData) {
        $(eventData.element).off('CornerstoneToolsMouseDrag', mouseDragCallback);
        $(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
    }

    function mouseDownCallback(e, eventData) {
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            $(eventData.element).on('CornerstoneToolsMouseDrag', mouseDragCallback);
            $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
            chooseLocation(e, eventData);
            return false; // false = cases jquery to preventDefault() and stopPropagation() this event
        }
    }

    function mouseDragCallback(e, eventData) {
        chooseLocation(e, eventData);
        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    function enable(element, mouseButtonMask, synchronizationContext) {
        var eventData = {
            mouseButtonMask: mouseButtonMask,
        };
        
        // Clear any currently existing toolData
        var toolData = cornerstoneTools.getToolState(element, toolType);
        toolData = [];

        cornerstoneTools.addToolState(element, toolType, {
            synchronizationContext: synchronizationContext,
        });

        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);

        $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);
    }

    // disables the reference line tool for the given element
    function disable(element) {
        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
    }

    // module/private exports
    cornerstoneTools.crosshairs = {
        activate: enable,
        deactivate: disable,
        enable: enable,
        disable: disable
    };

    function dragEndCallback(e, eventData) {
        $(eventData.element).off('CornerstoneToolsTouchDrag', dragCallback);
        $(eventData.element).off('CornerstoneToolsDragEnd', dragEndCallback);
    }

    function dragStartCallback(e, eventData) {
        $(eventData.element).on('CornerstoneToolsTouchDrag', dragCallback);
        $(eventData.element).on('CornerstoneToolsDragEnd', dragEndCallback);
        chooseLocation(e, eventData);
        return false;
    }

    function dragCallback(e, eventData) {
        chooseLocation(e, eventData);
        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    function enableTouch(element, synchronizationContext) {
        // Clear any currently existing toolData
        var toolData = cornerstoneTools.getToolState(element, toolType);
        toolData = [];

        cornerstoneTools.addToolState(element, toolType, {
            synchronizationContext: synchronizationContext,
        });

        $(element).off('CornerstoneToolsTouchStart', dragStartCallback);

        $(element).on('CornerstoneToolsTouchStart', dragStartCallback);
    }

    // disables the reference line tool for the given element
    function disableTouch(element) {
        $(element).off('CornerstoneToolsTouchStart', dragStartCallback);
    }

    cornerstoneTools.crosshairsTouch = {
        activate: enableTouch,
        deactivate: disableTouch,
        enable: enableTouch,
        disable: disableTouch
    };

})($, cornerstone, cornerstoneTools);
