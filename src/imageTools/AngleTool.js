var toolType = 'angle';

///////// BEGIN ACTIVE TOOL ///////
function createNewMeasurement(mouseEventData) {
    // create the measurement data for this tool with the end handle activated
    var angleData = {
        visible: true,
        active: true,
        handles: {
            start: {
                x: mouseEventData.currentPoints.image.x - 20,
                y: mouseEventData.currentPoints.image.y + 10,
                highlight: true,
                active: false
            },
            end: {
                x: mouseEventData.currentPoints.image.x,
                y: mouseEventData.currentPoints.image.y,
                highlight: true,
                active: true
            },
            start2: {
                x: mouseEventData.currentPoints.image.x - 20,
                y: mouseEventData.currentPoints.image.y + 10,
                highlight: true,
                active: false
            },
            end2: {
                x: mouseEventData.currentPoints.image.x,
                y: mouseEventData.currentPoints.image.y + 20,
                highlight: true,
                active: false
            }
        }
    };

    return angleData;
}
///////// END ACTIVE TOOL ///////

function pointNearTool(element, data, coords) {
    var lineSegment = {
        start: cornerstone.pixelToCanvas(element, data.handles.start),
        end: cornerstone.pixelToCanvas(element, data.handles.end)
    };

    var distanceToPoint = cornerstoneMath.lineSegment.distanceToPoint(lineSegment, coords);
    if (distanceToPoint < 5) {
        return true;
    }

    lineSegment.start = cornerstone.pixelToCanvas(element, data.handles.start2);
    lineSegment.end = cornerstone.pixelToCanvas(element, data.handles.end2);

    distanceToPoint = cornerstoneMath.lineSegment.distanceToPoint(lineSegment, coords);
    return (distanceToPoint < 5);
}

///////// BEGIN IMAGE RENDERING ///////
function onImageRendered(e) {
    var eventData = e.detail;

    // if we have no toolData for this element, return immediately as there is nothing to do
    var toolData = getToolState(e.currentTarget, toolType);
    if (toolData === undefined) {
        return;
    }

    // we have tool data for this element - iterate over each one and draw it
    var context = eventData.canvasContext.canvas.getContext('2d');
    context.setTransform(1, 0, 0, 1, 0, 0);

    //activation color
    var color;
    var lineWidth = toolStyle.getToolWidth();
    var font = textStyle.getFont();
    var config = angle.getConfiguration();

    for (var i = 0; i < toolData.data.length; i++) {
        context.save();

        // configurable shadow
        if (config && config.shadow) {
            context.shadowColor = config.shadowColor || '#000000';
            context.shadowOffsetX = config.shadowOffsetX || 1;
            context.shadowOffsetY = config.shadowOffsetY || 1;
        }

        var data = toolData.data[i];

        //differentiate the color of activation tool
        if (data.active) {
            color = toolColors.getActiveColor();
        } else {
            color = toolColors.getToolColor();
        }

        // draw the line
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = lineWidth;

        var handleStartCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.start);
        var handleEndCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.end);

        context.moveTo(handleStartCanvas.x, handleStartCanvas.y);
        context.lineTo(handleEndCanvas.x, handleEndCanvas.y);

        handleStartCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.start2);
        handleEndCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.end2);

        context.moveTo(handleStartCanvas.x, handleStartCanvas.y);
        context.lineTo(handleEndCanvas.x, handleEndCanvas.y);
        context.stroke();

        // draw the handles
        drawHandles(context, eventData, data.handles);

        // Draw the text
        context.fillStyle = color;

        // Need to work on correct angle to measure.  This is a cobb angle and we need to determine
        // where lines cross to measure angle. For now it will show smallest angle.
        var dx1 = (Math.ceil(data.handles.start.x) - Math.ceil(data.handles.end.x)) * eventData.image.columnPixelSpacing;
        var dy1 = (Math.ceil(data.handles.start.y) - Math.ceil(data.handles.end.y)) * eventData.image.rowPixelSpacing;
        var dx2 = (Math.ceil(data.handles.start2.x) - Math.ceil(data.handles.end2.x)) * eventData.image.columnPixelSpacing;
        var dy2 = (Math.ceil(data.handles.start2.y) - Math.ceil(data.handles.end2.y)) * eventData.image.rowPixelSpacing;

        var angle = Math.acos(Math.abs(((dx1 * dx2) + (dy1 * dy2)) / (Math.sqrt((dx1 * dx1) + (dy1 * dy1)) * Math.sqrt((dx2 * dx2) + (dy2 * dy2)))));
        angle = angle * (180 / Math.PI);

        var rAngle = roundToDecimal(angle, 2);
        var str = '00B0'; // degrees symbol
        var text = rAngle.toString() + String.fromCharCode(parseInt(str, 16));

        var textX = (handleStartCanvas.x + handleEndCanvas.x) / 2;
        var textY = (handleStartCanvas.y + handleEndCanvas.y) / 2;

        context.font = font;
        drawTextBox(context, text, textX, textY, color);
        context.restore();
    }
}
///////// END IMAGE RENDERING ///////

// module exports
const angle = mouseButtonTool({
    createNewMeasurement: createNewMeasurement,
    onImageRendered: onImageRendered,
    pointNearTool: pointNearTool,
    toolType: toolType
});

const angleTouch = touchTool({
    createNewMeasurement: createNewMeasurement,
    onImageRendered: onImageRendered,
    pointNearTool: pointNearTool,
    toolType: toolType
});

export {
  angle,
  angleTouch
};