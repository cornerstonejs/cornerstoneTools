import { addToolState, removeToolState, getToolState } from '../stateManagement/toolState.js';

var toolType = 'seedAnnotate';

// Define a callback to get your text annotation
// This could be used, e.g. to open a modal
function getTextCallback(doneGetTextCallback) {
    doneGetTextCallback(prompt('Enter your annotation:'));
}

function changeTextCallback(data, eventData, doneChangingTextCallback) {
    doneChangingTextCallback(prompt('Change your annotation:'));
}

var configuration = {
    getTextCallback: getTextCallback,
    changeTextCallback: changeTextCallback,
    drawHandles: false,
    drawHandlesOnHover: true,
    currentLetter: 'A',
    currentNumber: 0,
    showCoordinates: true,
    countUp: true
};
/// --- Mouse Tool --- ///

///////// BEGIN ACTIVE TOOL ///////
function addNewMeasurement(mouseEventData) {
    var element = mouseEventData.element;
    var config = seedAnnotate.getConfiguration();
    var measurementData = createNewMeasurement(mouseEventData);

    function doneGetTextCallback(text) {
        if (text !== null) {
            measurementData.text = text;
        } else {
            removeToolState(element, toolType, measurementData);
        }

        measurementData.active = false;
        cornerstone.updateImage(element);
    }

    // associate this data with this imageId so we can render it and manipulate it
    addToolState(element, toolType, measurementData);

    cornerstone.updateImage(element);
    moveHandle(mouseEventData, toolType, measurementData, measurementData.handles.end, function() {
        if (anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
            // delete the measurement
            removeToolState(element, toolType, measurementData);
        }

        if (measurementData.text === undefined) {
            config.getTextCallback(doneGetTextCallback);
        }

        cornerstone.updateImage(element);
    });
}

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
                active: false
            },
            textBox: {
                active: false,
                hasMoved: false,
                movesIndependently: false,
                drawnIndependently: true,
                allowedOutsideImage: true,
                hasBoundingBox: true
            }
        }
    };
    return measurementData;
}
///////// END ACTIVE TOOL ///////

function pointNearTool(element, data, coords) {
    if (!data.handles.end) {
        return;
    }

    var realCoords = cornerstone.pixelToCanvas(element, data.handles.end);
    var distanceToPoint = cornerstoneMath.point.distance(realCoords, coords);
    return (distanceToPoint < 25);
}

///////// BEGIN IMAGE RENDERING ///////
function onImageRendered(e) {
    var eventData = e.detail;
    // if we have no toolData for this element, return immediately as there is nothing to do
    var toolData = getToolState(e.currentTarget, toolType);
    if (!toolData) {
        return;
    }

    var enabledElement = eventData.enabledElement;

    // we have tool data for this element - iterate over each one and draw it
    var context = eventData.canvasContext.canvas.getContext('2d');
    context.setTransform(1, 0, 0, 1, 0, 0);

    // We need the canvas width
    var canvasWidth = eventData.canvasContext.canvas.width;

    var color;
    var lineWidth = toolStyle.getToolWidth();
    var font = textStyle.getFont();
    var config = seedAnnotate.getConfiguration();

    for (var i = 0; i < toolData.data.length; i++) {
        context.save();

        if (config && config.shadow) {
            context.shadowColor = config.shadowColor || '#000000';
            context.shadowOffsetX = config.shadowOffsetX || 1;
            context.shadowOffsetY = config.shadowOffsetY || 1;
        }

        var data = toolData.data[i];

        if (data.active) {
            color = toolColors.getActiveColor();
        } else {
            color = toolColors.getToolColor();
        }

        // Draw
        var handleCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.end);

        // Draw the circle always at the end of the handle
        drawCircle(context, handleCanvas, color, lineWidth);

        var handleOptions = {
            drawHandlesIfActive: (config && config.drawHandlesOnHover)
        };

        if (config.drawHandles) {
            drawHandles(context, eventData, handleCanvas, color, handleOptions);
        }

        // Draw the text
        if (data.text && data.text !== '') {
            context.font = font;

            var textPlusCoords = '';

            if ( config.showCoordinates ) {
                textPlusCoords = data.text + ' x: ' + Math.round(data.handles.end.x) +
                ' y: ' + Math.round(data.handles.end.y);
            } else {
                textPlusCoords = data.text;
            }

            // Calculate the text coordinates.
            var textWidth = context.measureText(textPlusCoords).width + 10;
            var textHeight = textStyle.getFontSize() + 10;

            var distance = Math.max(textWidth, textHeight) / 2 + 5;
            if (handleCanvas.x > (canvasWidth / 2)) {
                distance = -distance;
            }

            var textCoords;
            if (!data.handles.textBox.hasMoved) {
                textCoords = {
                    x: handleCanvas.x - textWidth / 2 + distance,
                    y: handleCanvas.y - textHeight / 2
                };

                var transform = cornerstone.internal.getTransform(enabledElement);
                transform.invert();

                var coords = transform.transformPoint(textCoords.x, textCoords.y);
                data.handles.textBox.x = coords.x;
                data.handles.textBox.y = coords.y;
            }

            textCoords = cornerstone.pixelToCanvas(eventData.element, data.handles.textBox);

            var boundingBox = drawTextBox(context, textPlusCoords, textCoords.x, textCoords.y, color);
            data.handles.textBox.boundingBox = boundingBox;

            if (data.handles.textBox.hasMoved) {
                // Draw dashed link line between tool and text
                var link = {
                    start: {},
                    end: {}
                };

                link.end.x = textCoords.x;
                link.end.y = textCoords.y;

                link.start = handleCanvas;

                var boundingBoxPoints = [
          {
                    // Top middle point of bounding box
                    x: boundingBox.left + boundingBox.width / 2,
                    y: boundingBox.top
                }, {
                    // Left middle point of bounding box
                    x: boundingBox.left,
                    y: boundingBox.top + boundingBox.height / 2
                }, {
                    // Bottom middle point of bounding box
                    x: boundingBox.left + boundingBox.width / 2,
                    y: boundingBox.top + boundingBox.height
                }, {
                    // Right middle point of bounding box
                    x: boundingBox.left + boundingBox.width,
                    y: boundingBox.top + boundingBox.height / 2
                },
        ];

                link.end = cornerstoneMath.point.findClosestPoint(boundingBoxPoints, link.start);

                context.beginPath();
                context.strokeStyle = color;
                context.lineWidth = lineWidth;
                context.setLineDash([ 2, 3 ]);
                context.moveTo(link.start.x, link.start.y);
                context.lineTo(link.end.x, link.end.y);
                context.stroke();
            }
        }

        context.restore();
    }
}
// ---- Touch tool ----

///////// BEGIN ACTIVE TOOL ///////
function addNewMeasurementTouch(touchEventData) {
    var element = touchEventData.element;
    var config = seedAnnotate.getConfiguration();
    var measurementData = createNewMeasurement(touchEventData);

    function doneGetTextCallback(text) {
        if (text !== null) {
            measurementData.text = text;
        } else {
            removeToolState(element, toolType, measurementData);
        }

        measurementData.active = false;
        cornerstone.updateImage(element);
    }

    // associate this data with this imageId so we can render it and manipulate it
    addToolState(element, toolType, measurementData);

    cornerstone.updateImage(element);
    moveHandle(touchEventData, toolType, measurementData, measurementData.handles.end, function() {
        if (anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
            // delete the measurement
            removeToolState(element, toolType, measurementData);
        }

        if (measurementData.text === undefined) {
            config.getTextCallback(doneGetTextCallback);
        }

        cornerstone.updateImage(element);
    });
}

function doubleClickCallback(e, eventData) {
    var element = eventData.element;
    var data;

    function doneChangingTextCallback(data, updatedText, deleteTool) {
        if (deleteTool === true) {
            removeToolState(element, toolType, data);
        } else {
            data.text = updatedText;
        }

        data.active = false;
        cornerstone.updateImage(element);
    }

    if (e.data && e.data.mouseButtonMask && !isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
        return;
    }

    var config = seedAnnotate.getConfiguration();

    var coords = eventData.currentPoints.canvas;
    var toolData = getToolState(element, toolType);

    // now check to see if there is a handle we can move
    if (!toolData) {
        return;
    }

    for (var i = 0; i < toolData.data.length; i++) {
        data = toolData.data[i];
        if (pointNearTool(element, data, coords) ||
            pointInsideBoundingBox(data.handles.textBox, coords)) {

            data.active = true;
            cornerstone.updateImage(element);
            // Allow relabelling via a callback
            config.changeTextCallback(data, eventData, doneChangingTextCallback);

            e.stopImmediatePropagation();
            return false;
        }
    }

    return false; // false = causes jquery to preventDefault() and stopPropagation() this event
}

function pressCallback(e, eventData) {
    var element = eventData.element;
    var data;

    function doneChangingTextCallback(data, updatedText, deleteTool) {
        console.log('pressCallback doneChangingTextCallback');
        if (deleteTool === true) {
            removeToolState(element, toolType, data);
        } else {
            data.text = updatedText;
        }

        data.active = false;
        cornerstone.updateImage(element);

        $(element).on('CornerstoneToolsTouchStart', seedAnnotateTouch.touchStartCallback);
        $(element).on('CornerstoneToolsTouchStartActive', seedAnnotateTouch.touchDownActivateCallback);
        $(element).on('CornerstoneToolsTap', seedAnnotateTouch.tapCallback);
    }

    if (e.data && e.data.mouseButtonMask && !isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
        return false;
    }

    var config = seedAnnotate.getConfiguration();

    var coords = eventData.currentPoints.canvas;
    var toolData = getToolState(element, toolType);

    // now check to see if there is a handle we can move
    if (!toolData) {
        return false;
    }

    if (eventData.handlePressed) {
        $(element).off('CornerstoneToolsTouchStart', seedAnnotateTouch.touchStartCallback);
        $(element).off('CornerstoneToolsTouchStartActive', seedAnnotateTouch.touchDownActivateCallback);
        $(element).off('CornerstoneToolsTap', seedAnnotateTouch.tapCallback);

        // Allow relabelling via a callback
        config.changeTextCallback(eventData.handlePressed, eventData, doneChangingTextCallback);

        e.stopImmediatePropagation();
        return false;
    }

    for (var i = 0; i < toolData.data.length; i++) {
        data = toolData.data[i];
        if (pointNearTool(element, data, coords) ||
          pointInsideBoundingBox(data.handles.textBox, coords)) {
            data.active = true;
            cornerstone.updateImage(element);

            $(element).off('CornerstoneToolsTouchStart', seedAnnotateTouch.touchStartCallback);
            $(element).off('CornerstoneToolsTouchStartActive', seedAnnotateTouch.touchDownActivateCallback);
            $(element).off('CornerstoneToolsTap', seedAnnotateTouch.tapCallback);

            // Allow relabelling via a callback
            config.changeTextCallback(data, eventData, doneChangingTextCallback);

            e.stopImmediatePropagation();
            return false;
        }
    }

    return false; // false = causes jquery to preventDefault() and stopPropagation() this event
}

const seedAnnotate = mouseButtonTool({
    addNewMeasurement: addNewMeasurement,
    createNewMeasurement: createNewMeasurement,
    onImageRendered: onImageRendered,
    pointNearTool: pointNearTool,
    toolType: toolType,
    mouseDoubleClickCallback: doubleClickCallback
});

seedAnnotate.setConfiguration(configuration);

const seedAnnotateTouch = touchTool({
    addNewMeasurement: addNewMeasurementTouch,
    createNewMeasurement: createNewMeasurement,
    onImageRendered: onImageRendered,
    pointNearTool: pointNearTool,
    toolType: toolType,
    pressCallback: pressCallback
});

export {
  seedAnnotate,
  seedAnnotateTouch
};