(function($, cornerstone, cornerstoneTools) {

    'use strict';

    var startPoints;

    function changeViewportScale(viewport, ticks) {
        var config = cornerstoneTools.zoom.getConfiguration();
        var pow = 1.7;
        
        var oldFactor = Math.log(viewport.scale) / Math.log(pow);
        var factor = oldFactor + ticks;
        
        var scale = Math.pow(pow, factor);
        if (config.maxScale && scale > config.maxScale) {
            viewport.scale = config.maxScale;
        } else if (config.minScale && scale < config.minScale) {
            viewport.scale = config.minScale;
        } else {
            viewport.scale = scale;
        }

        return viewport;
    }

    function boundPosition(position, width, height) {
        position.x = Math.max(position.x, 0);
        position.y = Math.max(position.y, 0);
        position.x = Math.min(position.x, width);
        position.y = Math.min(position.y, height);
        return position;
    }

    function correctShift(shift, viewport) {
        // Apply rotations
        if (viewport.rotation !== 0) {
            var angle = viewport.rotation * Math.PI / 180;
    
            var cosA = Math.cos(angle);
            var sinA = Math.sin(angle);
    
            var newX = shift.x * cosA - shift.y * sinA;
            var newY = shift.x * sinA + shift.y * cosA;

            shift.x = newX;
            shift.y = newY;
        }

        // Apply Flips        
        if (viewport.hflip) {
            shift.x *= -1;
        }

        if (viewport.vflip) {
            shift.y *= -1;
        }

        return shift;
    }

    function defaultStrategy(eventData, ticks) {
        var element = eventData.element;

        // Calculate the new scale factor based on how far the mouse has changed
        var viewport = changeViewportScale(eventData.viewport, ticks);
        cornerstone.setViewport(element, viewport);

        // Now that the scale has been updated, determine the offset we need to apply to the center so we can
        // keep the original start location in the same position
        var newCoords = cornerstone.pageToPixel(element, eventData.startPoints.page.x, eventData.startPoints.page.y);
        var shift = {
            x: eventData.startPoints.image.x - newCoords.x,
            y: eventData.startPoints.image.y - newCoords.y
        };

        shift = correctShift(shift, viewport);
        viewport.translation.x -= shift.x;
        viewport.translation.y -= shift.y;
        cornerstone.setViewport(element, viewport);
    }

    function translateStrategy(eventData, ticks) {
        var element = eventData.element;
        var image = eventData.image;

        // Calculate the new scale factor based on how far the mouse has changed
        var viewport = changeViewportScale(eventData.viewport, ticks);
        cornerstone.setViewport(element, viewport);

        var config = cornerstoneTools.zoom.getConfiguration();
        var shift,
            newCoords;

        var outwardsTranslateSpeed = 8;
        var inwardsTranslateSpeed = 8;
        var outwardsMinScaleToTranslate = 3;
        var minTranslation = 0.01;

        if (ticks < 0) {
            // Zoom outwards from the image center
            shift = {
                x: viewport.scale < outwardsMinScaleToTranslate ? viewport.translation.x / outwardsTranslateSpeed : 0,
                y: viewport.scale < outwardsMinScaleToTranslate ? viewport.translation.y / outwardsTranslateSpeed : 0
            };
            
            if (Math.abs(viewport.translation.x) < minTranslation) {
                viewport.translation.x = 0;
                shift.x = 0;
            } else if (Math.abs(viewport.translation.y) < minTranslation) {
                viewport.translation.y = 0;
                shift.y = 0;
            } else if (Math.abs(viewport.translation.x) < minTranslation &&
                       Math.abs(viewport.translation.y) < minTranslation) {
                cornerstone.setViewport(element, viewport);
                return false;
            }
        } else {
            newCoords = cornerstone.pageToPixel(element, startPoints.page.x, startPoints.page.y);
            if (config && config.preventZoomOutsideImage) {
                startPoints.image = boundPosition(startPoints.image, image.width, image.height);
                newCoords = boundPosition(newCoords, image.width, image.height);
            }
            // Zoom inwards to the current image point
            var desiredTranslation = {
                x: image.width / 2 - startPoints.image.x,
                y: image.height / 2 - startPoints.image.y
            };

            var distanceToDesired = {
                x: viewport.translation.x - desiredTranslation.x,
                y: viewport.translation.y - desiredTranslation.y
            };

            shift = {
                x: distanceToDesired.x / inwardsTranslateSpeed,
                y: distanceToDesired.y / inwardsTranslateSpeed
            };

            if (Math.abs(distanceToDesired.x) < minTranslation) {
                viewport.translation.x = desiredTranslation.x;
                shift.x = 0;
            } else if (Math.abs(distanceToDesired.y) < minTranslation) {
                viewport.translation.y = desiredTranslation.y;
                shift.y = 0;
            } else if (Math.abs(distanceToDesired.x) < minTranslation &&
                       Math.abs(distanceToDesired.y) < minTranslation) {
                cornerstone.setViewport(element, viewport);
                return false;
            }
        }

        shift = correctShift(shift, viewport);
        if (!shift.x && !shift.y) {
            return false;
        }

        viewport.translation.x -= shift.x;
        viewport.translation.y -= shift.y;
        cornerstone.setViewport(element, viewport);
    }

    function mouseUpCallback(e, eventData) {
        $(eventData.element).off('CornerstoneToolsMouseDrag', dragCallback);
        $(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
    }

    function mouseDownCallback(e, eventData) {
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            startPoints = eventData.startPoints; // Used for translateStrategy
            $(eventData.element).on('CornerstoneToolsMouseDrag', dragCallback);
            $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
            return false; // false = cases jquery to preventDefault() and stopPropagation() this event
        }
    }

    function dragCallback(e, eventData) {
        if (!eventData.deltaPoints.page.y) {
            return false;
        }

        var ticks = eventData.deltaPoints.page.y / 100;
        cornerstoneTools.zoom.strategy(eventData, ticks);
        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    function mouseWheelCallback(e, eventData) {
        var ticks = -eventData.direction / 4;
        var viewport = changeViewportScale(eventData.viewport, ticks);
        cornerstone.setViewport(eventData.element, viewport);
    }

    function touchPinchCallback(e, eventData) {
        var config = cornerstoneTools.zoom.getConfiguration();
        var viewport = eventData.viewport;
        var element = eventData.element;
        var scale = eventData.scaleChange;
        
        // Change the scale based on the pinch gesture's scale change
        if (config.maxScale && scale > config.maxScale) {
            viewport.scale = config.maxScale;
        } else if (config.minScale && scale < config.minScale) {
            viewport.scale = config.minScale;
        } else {
            viewport.scale = scale;
        }

        cornerstone.setViewport(element, viewport);

        // Now that the scale has been updated, determine the offset we need to apply to the center so we can
        // keep the original start location in the same position
        var newCoords = cornerstone.pageToPixel(element, eventData.startPoints.page.x, eventData.startPoints.page.y);
        var shift = {
            x: eventData.startPoints.image.x - newCoords.x,
            y: eventData.startPoints.image.y - newCoords.y
        };

        shift = correctShift(shift, viewport);
        viewport.translation.x -= shift.x;
        viewport.translation.y -= shift.y;
        cornerstone.setViewport(element, viewport);
    }

    cornerstoneTools.zoom = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    cornerstoneTools.zoom.strategies = {
        default: defaultStrategy,
        translate: translateStrategy
    };
    cornerstoneTools.zoom.strategy = defaultStrategy;

    cornerstoneTools.zoomWheel = cornerstoneTools.mouseWheelTool(mouseWheelCallback);
    cornerstoneTools.zoomTouchPinch = cornerstoneTools.touchPinchTool(touchPinchCallback);
    cornerstoneTools.zoomTouchDrag = cornerstoneTools.touchDragTool(dragCallback);

})($, cornerstone, cornerstoneTools);
