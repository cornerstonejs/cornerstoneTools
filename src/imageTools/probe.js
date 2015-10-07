(function($, cornerstone, cornerstoneTools) {

    'use strict';

    var toolType = 'probe';

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
            cornerstoneTools.drawHandles(context, eventData, data.handles, color);

            var x = Math.round(data.handles.end.x);
            var y = Math.round(data.handles.end.y);
            var storedPixels;

            var text,
                str;

            if (x < 0 || y < 0 || x >= eventData.image.columns || y >= eventData.image.rows) {
                return;
            }

            if (eventData.image.color) {
                text = '' + x + ', ' + y;
                storedPixels = cornerstoneTools.getRGBPixels(eventData.element, x, y, 1, 1);
                str = 'R: ' + storedPixels[0] + ' G: ' + storedPixels[1] + ' B: ' + storedPixels[2];
            } else {
                storedPixels = cornerstone.getStoredPixels(eventData.element, x, y, 1, 1);
                var sp = storedPixels[0];
                var mo = sp * eventData.image.slope + eventData.image.intercept;
                var suv = cornerstoneTools.calculateSUV(eventData.image, sp);

                // Draw text
                text = '' + x + ', ' + y;
                str = 'SP: ' + sp + ' MO: ' + parseFloat(mo.toFixed(3));
                if (suv) {
                    str += ' SUV: ' + parseFloat(suv.toFixed(3));
                }
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
            cornerstoneTools.drawTextBox(context, text, textCoords.x, textCoords.y, color);
            context.restore();
        }
    }
    ///////// END IMAGE RENDERING ///////

    // module exports
    cornerstoneTools.probe = cornerstoneTools.mouseButtonTool({
        createNewMeasurement: createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool: pointNearTool,
        toolType: toolType
    });
    cornerstoneTools.probeTouch = cornerstoneTools.touchTool({
        createNewMeasurement: createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool: pointNearTool,
        toolType: toolType
    });

})($, cornerstone, cornerstoneTools);
