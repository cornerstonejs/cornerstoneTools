(function($, cornerstone, cornerstoneTools) {

    'use strict';

    var toolType = 'probex';

    ///////// BEGIN ACTIVE TOOL ///////
    function createNewMeasurement(mouseEventData) {
        // create the measurement data for this tool with the end handle activated
        var measurementData = {
            visible: true,
            active: true,
            handles: {
                end: {
                    x: mouseEventData.currentPoints.image.x,
                    y: mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: true
                }
            }
        };
        return measurementData;
    }
    ///////// END ACTIVE TOOL ///////

    ///////// BEGIN IMAGE RENDERING ///////
    function pointNearTool(element, data, coords) {
        var endCanvas = cornerstone.pixelToCanvas(element, data.handles.end);
        return cornerstoneMath.point.distance(endCanvas, coords) < 5;
    }

    function get_value_str(element, image, x, y){
        var str, text, storedPixels;
        if (image.color) {
            text = '' + x + ', ' + y;

            storedPixels = cornerstoneTools.getRGBPixels(element, x, y, 1, 1);

            var config = cornerstoneTools.probex.getConfiguration();
            if (config.valuesmap){
                str = config.valuesmap(image.imageId, storedPixels);
            } else {
                str = 'R: ' + storedPixels[0] + ' G: ' + storedPixels[1] + ' B: ' + storedPixels[2];
            }
        } else {
            storedPixels = cornerstone.getStoredPixels(element, x, y, 1, 1);
            var sp = storedPixels[0];
            var mo = sp * image.slope + image.intercept;
            str = '' + mo;
        }

        return str;
    }

    function onImageRendered(e, eventData) {
        // if we have no toolData for this element, return immediately as there is nothing to do
        var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);
        if (!toolData) {
            return;
        }

        // we have tool data for this element - iterate over each one and draw it
        var context = eventData.canvasContext.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        var color;
        var font = cornerstoneTools.textStyle.getFont();
        var fontHeight = cornerstoneTools.textStyle.getFontSize();

        for (var i = 0; i < toolData.data.length; i++) {

            context.save();
            var data = toolData.data[i];

            if (data.active) {
                color = cornerstoneTools.toolColors.getActiveColor();
            } else {
                color = cornerstoneTools.toolColors.getToolColor();
            }

            // draw the handles
            cornerstoneTools.drawHandles(context, eventData, data.handles, color, {
                handleRadius: 3
            });

            var x = Math.round(data.handles.end.x);
            var y = Math.round(data.handles.end.y);

            if (x < 0 || y < 0 || x >= eventData.image.columns || y >= eventData.image.rows) {
                return;
            }

            var cache = data.cache;
            var str;

            if (cache === undefined || cache.x !== x || cache.y !== y){
                str = get_value_str(eventData.element, eventData.image, x, y);
                data.cache = {
                    x: x,
                    y: y,
                    str: str
                };
            }else {
                str = cache.str;
            }

            var coords = {
                // translate the x/y away from the cursor
                x: data.handles.end.x + 3,
                y: data.handles.end.y - 3
            };
            var textCoords = cornerstone.pixelToCanvas(eventData.element, coords);

            context.font = font;
            context.fillStyle = color;

            cornerstoneTools.drawTextBox(context, str, textCoords.x, textCoords.y + fontHeight + 5, color);
            //cornerstoneTools.drawTextBox(context, text, textCoords.x, textCoords.y, color);
            context.restore();
        }
    }
    ///////// END IMAGE RENDERING ///////

    // module exports
    cornerstoneTools.probex = cornerstoneTools.mouseButtonTool({
        createNewMeasurement: createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool: pointNearTool,
        toolType: toolType
    });
    cornerstoneTools.probexTouch = cornerstoneTools.touchTool({
        createNewMeasurement: createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool: pointNearTool,
        toolType: toolType
    });

})($, cornerstone, cornerstoneTools);
