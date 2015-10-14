(function($, cornerstone, cornerstoneTools) {

    'use strict';

    var configuration = {
        magnifySize: 100,
        magnificationLevel: 2,
    };

    var browserName;

    /** Remove the magnifying glass when the mouse event ends */
    function mouseUpCallback(e, eventData) {
        $(eventData.element).off('CornerstoneToolsMouseDrag', dragCallback);
        $(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
        hideTool(eventData);
    }

    function hideTool(eventData) {
        $(eventData.element).find('.magnifyTool').hide();
        // Re-enable the mouse cursor
        document.body.style.cursor = 'default';
    }

    /** Draw the magnifying glass on mouseDown, and begin tracking mouse movements */
    function mouseDownCallback(e, eventData) {
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            $(eventData.element).on('CornerstoneToolsMouseDrag', eventData, dragCallback);
            $(eventData.element).on('CornerstoneToolsMouseUp', eventData, mouseUpCallback);
            drawMagnificationTool(eventData);
            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }
    }

    function dragEndCallback(e, eventData) {
        $(eventData.element).off('CornerstoneToolsDragEnd', dragEndCallback);
        $(eventData.element).off('CornerstoneToolsTouchEnd', dragEndCallback);
        hideTool(eventData);
    }

    /** Drag callback is triggered by both the touch and mouse magnify tools */
    function dragCallback(e, eventData) {
        drawMagnificationTool(eventData);
        if (eventData.isTouchEvent === true) {
            $(eventData.element).on('CornerstoneToolsDragEnd', dragEndCallback);
            $(eventData.element).on('CornerstoneToolsTouchEnd', dragEndCallback);
        }

        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    /** Draws the magnifying glass */
    function drawMagnificationTool(eventData) {
        var magnify = $(eventData.element).find('.magnifyTool').get(0);

        if (!magnify) {
            createMagnificationCanvas(eventData.element);
        }

        var config = cornerstoneTools.magnify.getConfiguration();

        var magnifySize = config.magnifySize;
        var magnificationLevel = config.magnificationLevel;

        // The 'not' magnifyTool class here is necessary because cornerstone places
        // no classes of it's own on the canvas we want to select
        var canvas = $(eventData.element).find('canvas').not('.magnifyTool').get(0);
        var context = canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        var zoomCtx = magnify.getContext('2d');
        zoomCtx.setTransform(1, 0, 0, 1, 0, 0);

        // Calculate the on-canvas location of the mouse pointer / touch
        var canvasLocation = cornerstone.pixelToCanvas(eventData.element, eventData.currentPoints.image);

        if (eventData.isTouchEvent === true) {
            canvasLocation.y -= 0.5 * magnifySize;
        }

        canvasLocation.x = Math.max(canvasLocation.x, 0);
        canvasLocation.x = Math.min(canvasLocation.x, canvas.width);

        canvasLocation.y = Math.max(canvasLocation.y, 0);
        canvasLocation.y = Math.min(canvasLocation.y, canvas.height);

        // Clear the rectangle
        zoomCtx.clearRect(0, 0, magnifySize, magnifySize);
        zoomCtx.fillStyle = 'transparent';

        // Fill it with the pixels that the mouse is clicking on
        zoomCtx.fillRect(0, 0, magnifySize, magnifySize);
        
        var getSize = magnifySize / magnificationLevel;
        var copyFrom = {
            x: canvasLocation.x - 0.5 * getSize,
            y: canvasLocation.y - 0.5 * getSize
        };

        if (browserName === 'Safari') {
            // Safari breaks when trying to copy pixels with negative indices
            // This prevents proper Magnify usage
            copyFrom.x = Math.max(copyFrom.x, 0);
            copyFrom.y = Math.max(copyFrom.y, 0);
        }

        copyFrom.x = Math.min(copyFrom.x, canvas.width);
        copyFrom.y = Math.min(copyFrom.y, canvas.height);

        var scaledMagnify = {
            x: (canvas.width - copyFrom.x) * magnificationLevel,
            y: (canvas.height - copyFrom.y) * magnificationLevel
        };
        zoomCtx.drawImage(canvas, copyFrom.x, copyFrom.y, canvas.width - copyFrom.x, canvas.height - copyFrom.y, 0, 0, scaledMagnify.x, scaledMagnify.y);

        if (eventData.isTouchEvent === true) {
            magnify.style.top = canvasLocation.y - 1 * magnifySize + 'px';
            magnify.style.left = canvasLocation.x - 0.5 * magnifySize + 'px';
        } else {
            // Place the magnification tool at the same location as the pointer
            magnify.style.top = canvasLocation.y - 0.5 * magnifySize + 'px';
            magnify.style.left = canvasLocation.x - 0.5 * magnifySize + 'px';
        }

        magnify.style.display = 'block';

        // Hide the mouse cursor, so the user can see better
        document.body.style.cursor = 'none';
    }

    /** Creates the magnifying glass canvas */
    function createMagnificationCanvas(element) {
        // If the magnifying glass canvas doesn't already exist
        if ($(element).find('.magnifyTool').length === 0) {
            // Create a canvas and append it as a child to the element
            var magnify = document.createElement('canvas');
            // The magnifyTool class is used to find the canvas later on
            magnify.classList.add('magnifyTool');

            var config = cornerstoneTools.magnify.getConfiguration();
            magnify.width = config.magnifySize;
            magnify.height = config.magnifySize;

            // Make sure position is absolute so the canvas can follow the mouse / touch
            magnify.style.position = 'absolute';
            element.appendChild(magnify);
        }
    }

    /** Find the magnifying glass canvas and remove it */
    function removeMagnificationCanvas(element) {
        $(element).find('.magnifyTool').remove();
    }

    // --- Mouse tool activate / disable --- //
    function disable(element) {
        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
        removeMagnificationCanvas(element);
    }

    function enable(element) {
        var config = cornerstoneTools.magnify.getConfiguration(config);

        if (!browserName) {
            var infoString = cornerstoneTools.getBrowserInfo();
            var info = infoString.split(' ');
            browserName = info[0];
        }

        createMagnificationCanvas(element);
    }

    function activate(element, mouseButtonMask) {
        var eventData = {
            mouseButtonMask: mouseButtonMask,
        };

        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);

        $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);
        createMagnificationCanvas(element);
    }

    // --- Touch tool activate / disable --- //
    function getConfiguration() {
        return configuration;
    }

    function setConfiguration(config) {
        configuration = config;
    }

    // module exports
    cornerstoneTools.magnify = {
        enable: enable,
        activate: activate,
        deactivate: disable,
        disable: disable,
        getConfiguration: getConfiguration,
        setConfiguration: setConfiguration
    };

    var options = {
        fireOnTouchStart: true,
        activateCallback: createMagnificationCanvas,
        disableCallback: removeMagnificationCanvas
    };
    cornerstoneTools.magnifyTouchDrag = cornerstoneTools.touchDragTool(dragCallback, options);

})($, cornerstone, cornerstoneTools);
