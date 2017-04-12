(function($, cornerstone, cornerstoneTools) {

    'use strict';

    var tool_data = null;
    var interacting_mode = false;
    var last_session = null;

    function mouseUpCallback(e, eventData) {
        if (interacting_mode === false){
            return;
        }

        $(eventData.element).off('CornerstoneToolsMouseDrag', mouseDragCallback);
        $(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
        $(eventData.element).off('CornerstoneToolsMouseClick', mouseUpCallback);
        interactionEnd(e, eventData);
        // reactivate mouseDownCallbacks
        interacting_mode = false;
        last_session = Date.now();
    }

    function mouseDownCallback(e, eventData) {
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            // disable further mouseDownCallbacks
            var ts = Date.now();
            if (interacting_mode === true){
                // sanity check, should not happen
                return;
            }

            if (last_session !== null && (ts - last_session < 100)){
                // rate limit to one session per 1/10 of second
                return;
            }

            interacting_mode = true;
            interactionStart(e, eventData);
            $(eventData.element).on('CornerstoneToolsMouseDrag', mouseDragCallback);
            $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
            $(eventData.element).on('CornerstoneToolsMouseClick', mouseUpCallback);
            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }
    }

    function touchEndCallback(e, eventData) {
        $(eventData.element).off('CornerstoneToolsTouchDrag', dragCallback);
        $(eventData.element).off('CornerstoneToolsTouchEnd', touchEndCallback);
        $(eventData.element).off('CornerstoneToolsTap', touchEndCallback);
        interactionEnd(e, eventData);
    }

    function touchStartCallback(e, eventData) {
        interactionStart(e, eventData);
        $(eventData.element).on('CornerstoneToolsTouchDrag', dragCallback);
        $(eventData.element).on('CornerstoneToolsTouchEnd', touchEndCallback);
        $(eventData.element).on('CornerstoneToolsTap', touchEndCallback);
        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    function defaultStrategy(eventData) {
        // here we normalize the ww/wc adjustments so the same number of on screen pixels
        // adjusts the same percentage of the dynamic range of the image.  This is needed to
        // provide consistency for the ww/wc tool regardless of the dynamic range (e.g. an 8 bit
        // image will feel the same as a 16 bit image would)
        var maxVOI = eventData.image.maxPixelValue * eventData.image.slope + eventData.image.intercept;
        var minVOI = eventData.image.minPixelValue * eventData.image.slope + eventData.image.intercept;
        var imageDynamicRange = maxVOI - minVOI;
        var multiplier = imageDynamicRange / 1024;

        var deltaX = eventData.deltaPoints.page.x * multiplier;
        var deltaY = eventData.deltaPoints.page.y * multiplier;

        eventData.viewport.voi.windowWidth += (deltaX);
        eventData.viewport.voi.windowCenter += (deltaY);
    }

    function mouseDragCallback(e, eventData) {
        cornerstoneTools.wwwclod.strategy(eventData);
        cornerstone.setViewport(eventData.element, eventData.viewport);
        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
    }

    function dragCallback(e, eventData) {
        cornerstoneTools.wwwclod.strategy(eventData);
        cornerstone.setViewport(eventData.element, eventData.viewport);
        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
    }

    function interactionStart(e, eventData) {

        var config = cornerstoneTools.wwwclod.getConfiguration();
        var target_width = 256;
        var target_height = 256;
        var orig_data;

        if (config){
            if (config.target_width){
                target_width = config.target_width;
            }

            if (config.target_height){
                target_height = config.target_height;
            }
        }

        if ((eventData.image.height < (target_height * 1.5)) && (eventData.image.width < (target_width * 1.5))){
            orig_data = {
                unchanged: true
            };
            tool_data = orig_data;
            return;
        }

        var viewport = eventData.viewport;
        var rotation = viewport.rotation;
        var valid_rotations = [ 0, 90, 180, 270 ];
        if (valid_rotations.indexOf(rotation) < 0){
            console.warn("Can't handle rotations which are not multiples of 90, falling back to standard mode");
            orig_data = {
                unchanged: true
            };
            tool_data = orig_data;
            return;
        }

        var image = eventData.image;
        var orig_viewport = $.extend(true, {}, viewport);

        orig_data = {
            image: image,
            viewport: orig_viewport
        };
        tool_data = orig_data;

        var enabledElement = cornerstone.getEnabledElement(eventData.element);
        var canvas = $(eventData.element).find('canvas').get(0);
        var canvas_width = canvas.width;
        var canvas_height = canvas.height;

        var i_transform = cornerstone.internal.getTransform(enabledElement);
        i_transform.invert();
        var bottom_right;
        var top_left;

        if (rotation === 0){
            bottom_right = i_transform.transformPoint(canvas_width, canvas_height);
            top_left = i_transform.transformPoint(0, 0);
        }else if (rotation === 270){
            bottom_right = i_transform.transformPoint(canvas_width, 0);
            top_left = i_transform.transformPoint(0, canvas_height);
        }else if (rotation === 180){
            bottom_right = i_transform.transformPoint(0, 0);
            top_left = i_transform.transformPoint(canvas_width, canvas_height);
        }else if (rotation === 90){
            bottom_right = i_transform.transformPoint(0, canvas_height);
            top_left = i_transform.transformPoint(canvas_width, 0);
        }

        bottom_right.x = Math.min(bottom_right.x, image.width);
        bottom_right.y = Math.min(bottom_right.y, image.height);

        top_left.x = Math.max(0, top_left.x);
        top_left.y = Math.max(0, top_left.y);

        var down_image = downsample_image(image, target_width, target_height, top_left, bottom_right);

        var relative_center = {
            x: (top_left.x + bottom_right.x) / 2 - (image.width / 2),
            y: (top_left.y + bottom_right.y) / 2 - (image.height / 2)
        };

        var translation2;
        // translation is applied after rotation
        if (rotation === 0){
            translation2 = {
                x: (viewport.translation.x + relative_center.x) / ((bottom_right.x - top_left.x) / (target_width)),
                y: (viewport.translation.y + relative_center.y) / ((bottom_right.y - top_left.y) / (target_height))
            };
        }else if (rotation === 270){
            translation2 = {
                x: (viewport.translation.x + relative_center.y) / ((bottom_right.y - top_left.y) / (target_height)),
                y: (viewport.translation.y - relative_center.x) / ((bottom_right.x - top_left.x) / (target_width))
            };
        }else if (rotation === 180){
            translation2 = {
                x: (viewport.translation.x - relative_center.x) / ((bottom_right.x - top_left.x) / (target_width)),
                y: (viewport.translation.y - relative_center.y) / ((bottom_right.y - top_left.y) / (target_height))
            };
        }else if (rotation === 90){
            translation2 = {
                x: (viewport.translation.x - relative_center.y) / ((bottom_right.y - top_left.y) / (target_height)),
                y: (viewport.translation.y + relative_center.x) / ((bottom_right.x - top_left.x) / (target_width))
            };
        }

        //viewport.translation = {x: 0, y:0};
        viewport.translation = translation2;
        if (down_image.rowPixelSpacing * target_width > down_image.columnPixelSpacing * target_height){
            viewport.scale = viewport.scale * ((bottom_right.x - top_left.x) / (target_width));
        }else {
            viewport.scale = viewport.scale * ((bottom_right.y - top_left.y) / (target_height));
        }

        cornerstone.displayImage(eventData.element, down_image, viewport);
        cornerstone.setViewport(eventData.element, viewport);
        return false; // false = cases jquery to preventDefault() and stopPropagation() this event
    }

    function interactionEnd(e, eventData){
        var orig_data = tool_data;
        if ( (!orig_data) || ('unchanged' in orig_data) ){
            cornerstoneTools.clearToolState(eventData.element,'wwwclod');
            return;
        }

        var modified_vieport = cornerstone.getViewport(eventData.element);
        var orig_image = orig_data.image;
        var viewport = orig_data.viewport;
        viewport.voi = modified_vieport.voi;
        cornerstone.setViewport(eventData.element, viewport);
        cornerstone.displayImage(eventData.element, orig_image, viewport);
    }

    function downsample_image(image, target_width, target_height, top_left, bottom_right){
        var image_data = image.getPixelData();
        var img_width = image.width;
        var offset_y = top_left.y;
        var offset_x = top_left.x;
        var stride_y = (bottom_right.y - top_left.y) / target_height;
        var stride_x = (bottom_right.x - top_left.x) / target_width;
        var i,j,i2,j2,j2c;

        var pixels_array;
        if (!image.color){
            pixels_array = new image_data.constructor(target_height * target_width);
            j2c = new Array(target_width);
            for (j = 0; j < target_width; j++){
                j2c[j] = Math.ceil(offset_x + (j + 0.5) * stride_x);
            }

            for (i = 0; i< target_height; i++){
                i2 = Math.ceil(offset_y + (i + 0.5) * stride_y);
                for (j = 0; j < target_width; j++){
                    j2 = j2c[j];
                    pixels_array[i * target_width + j] = image_data[i2 * img_width + j2];
                }
            }
        } else {
            pixels_array = new image_data.constructor(target_height * target_width * 4);
            j2c = new Array(target_width);
            for (j = 0; j < target_width; j++){
                j2c[j] = Math.ceil(offset_x + (j + 0.5) * stride_x);
            }

            for (i = 0; i< target_height; i++){
                i2 = Math.ceil(offset_y + (i + 0.5) * stride_y);
                for (j = 0; j < target_width; j++){
                    j2 = j2c[j];
                    pixels_array[4 * (i * target_width + j) + 0] = image_data[4 * (i2 * img_width + j2) + 0];
                    pixels_array[4 * (i * target_width + j) + 1] = image_data[4 * (i2 * img_width + j2) + 1];
                    pixels_array[4 * (i * target_width + j) + 2] = image_data[4 * (i2 * img_width + j2) + 2];
                    pixels_array[4 * (i * target_width + j) + 3] = image_data[4 * (i2 * img_width + j2) + 3];
                }
            }
        }

        function get_pixels(){
            return pixels_array;
        }

        var image_2 = {
            imageId: image.imageId + '_down',
            minPixelValue: image.minPixelValue,
            maxPixelValue: image.maxPixelValue,
            rows: target_height,
            columns: target_width,
            height: target_height,
            width: target_width,
            getPixelData: get_pixels,
            color: image.color,
            columnPixelSpacing: (image.columnPixelSpacing?image.columnPixelSpacing:1) / stride_y,
            rowPixelSpacing: (image.rowPixelSpacing?image.rowPixelSpacing:1) / stride_x,
            invert: false,
            sizeInBytes: target_width * target_height * 2 * (image.color?1:4),
            render: image.render,
            slope: image.slope,
            intercept: image.intercept,
            windowCenter: image.windowCenter,
            windowWidth: image.windowWidth
        };
        return image_2;
    }

    cornerstoneTools.wwwclod = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    cornerstoneTools.wwwclodTouchDrag = cornerstoneTools.touchDragTool(touchStartCallback);
    cornerstoneTools.wwwclod.strategies = {
        default: defaultStrategy
    };
    cornerstoneTools.wwwclod.strategy = defaultStrategy;

})($, cornerstone, cornerstoneTools);
