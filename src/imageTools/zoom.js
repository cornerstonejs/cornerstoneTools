(function($, cornerstone, cornerstoneTools) {

    'use strict';

    var startPoints;

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

    function defaultStrategy(element, viewport, ticks) {
        // Calculate the new scale factor based on how far the mouse has changed
        var config = cornerstoneTools.zoom.getConfiguration();

        var pow = 1.7;
        var oldFactor = Math.log(viewport.scale) / Math.log(pow);

        var factor;
        if (config && config.invert === true) {
            factor = oldFactor - ticks;
        } else {
            factor = oldFactor + ticks;
        }
        
        var scale = Math.pow(pow, factor);
        viewport.scale = scale;
        
        if (config && config.maxScale && scale > config.maxScale) {
            viewport.scale = config.maxScale;
        } else if (config && config.minScale && scale < config.minScale) {
            viewport.scale = config.minScale;
        }

        cornerstone.setViewport(element, viewport);
    }

    function mouseUpCallback(e, eventData) {
        $(eventData.element).off('CornerstoneToolsMouseDrag', mouseDragCallback);
        $(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
    }

    function mouseDownCallback(e, eventData) {
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            startPoints = eventData.startPoints;
            $(eventData.element).on('CornerstoneToolsMouseDrag', mouseDragCallback);
            $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
            return false; // false = cases jquery to preventDefault() and stopPropagation() this event
        }
    }

    function mouseDragCallback(e, eventData) {
        var ticks = eventData.deltaPoints.page.y / 100;
        if (!ticks) {
            return false;
        }

        cornerstoneTools.zoom.strategy(eventData.element, eventData.viewport, ticks);

        // Now that the scale has been updated, determine the offset we need to apply to the center so we can
        // keep the original start location in the same position
        var config = cornerstoneTools.zoom.getConfiguration();
        var shift,
            newCoords;
        var viewport = eventData.viewport;

        var outwardsTranslateSpeed = 10;
        var inwardsTranslateSpeed = 10;
        var outwardsMinScaleToTranslate = 5;
        var minTranslation = 0.01;

        if (ticks < 0 && config && config.zoomOutFromCenter) {
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
                cornerstone.setViewport(eventData.element, viewport);
                return false;
            }
        } else {
            newCoords = cornerstone.pageToPixel(eventData.element, startPoints.page.x, startPoints.page.y);
            if (config && config.preventZoomOutsideImage) {
                startPoints.image = boundPosition(startPoints.image, eventData.image.width, eventData.image.height);
                newCoords = boundPosition(newCoords, eventData.image.width, eventData.image.height);
            }
            // Zoom inwards to the current image point
            var desiredTranslation = {
                x: eventData.image.width / 2 - startPoints.image.x,
                y: eventData.image.height / 2 - startPoints.image.y
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
                cornerstone.setViewport(eventData.element, viewport);
                return false;
            }
        }

        shift = correctShift(shift, viewport);
        if (!shift.x && !shift.y) {
            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }

        viewport.translation.x -= shift.x;
        viewport.translation.y -= shift.y;
        cornerstone.setViewport(eventData.element, viewport);
        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    function mouseWheelCallback(e, eventData) {
        var ticks = -eventData.direction / 4;
        cornerstoneTools.zoom.strategy(eventData.element, eventData.viewport, ticks);
    }

    function touchPinchCallback(e, eventData) {
        var ticks = eventData.direction / 4;
        var viewport = eventData.viewport;
        var config = cornerstoneTools.zoom.getConfiguration();
        var pow = 1.7;
        
        var oldFactor = Math.log(viewport.scale) / Math.log(pow);
        var factor = oldFactor + ticks;
        
        var scale = Math.pow(pow, factor);
        viewport.scale = scale;
        
        if (config.maxScale && scale > config.maxScale) {
            viewport.scale = config.maxScale;
        } else if (config.minScale && scale < config.minScale) {
            viewport.scale = config.minScale;
        }

        cornerstone.setViewport(eventData.element, viewport);
    }

    function zoomTouchDrag(e, eventData) {
        var dragData = eventData;
        var ticks = dragData.deltaPoints.page.y / 100;
        cornerstoneTools.zoom.strategy(dragData.element, dragData.viewport, ticks);

        // Now that the scale has been updated, determine the offset we need to apply to the center so we can
        // keep the original start location in the same position
        var newCoords = cornerstone.pageToPixel(dragData.element, dragData.startPoints.page.x, dragData.startPoints.page.y);
        var shift = {
            x: dragData.startPoints.image.x - newCoords.x, y: dragData.startPoints.image.y - newCoords.y
        };

        shift = correctShift(shift, dragData.viewport);
        dragData.viewport.translation.x -= shift.x;
        dragData.viewport.translation.y -= shift.y;
        cornerstone.setViewport(dragData.element, dragData.viewport);
        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    cornerstoneTools.zoom = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    cornerstoneTools.zoom.strategies = {
        default: defaultStrategy
    };
    cornerstoneTools.zoom.strategy = defaultStrategy;

    cornerstoneTools.zoomWheel = cornerstoneTools.mouseWheelTool(mouseWheelCallback);
    cornerstoneTools.zoomTouchPinch = cornerstoneTools.touchPinchTool(touchPinchCallback);
    cornerstoneTools.zoomTouchDrag = cornerstoneTools.touchDragTool(zoomTouchDrag);

})($, cornerstone, cornerstoneTools);
