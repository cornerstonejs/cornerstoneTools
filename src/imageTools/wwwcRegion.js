import { getToolState, addToolState } from '../stateManagement/toolState.js';
import getLuminance from '../util/getLuminance.js';

var toolType = 'wwwcRegion';

var configuration = {
    minWindowWidth: 10
};

var currentMouseButtonMask;

/** Calculates the minimum, maximum, and mean value in the given pixel array */
function calculateMinMaxMean(storedPixelLuminanceData, globalMin, globalMax) {
    var numPixels = storedPixelLuminanceData.length;

    if (numPixels < 2) {
        return {
            min: globalMin,
            max: globalMax,
            mean: (globalMin + globalMax) / 2
        };
    }

    var min = globalMax;
    var max = globalMin;
    var sum = 0;

    for (var index = 0; index < numPixels; index++) {
        var spv = storedPixelLuminanceData[index];
        min = Math.min(min, spv);
        max = Math.max(max, spv);
        sum += spv;
    }

    return {
        min: min,
        max: max,
        mean: sum / numPixels
    };
}

/* Erases the toolData and rebinds the handlers when the image changes */
function newImageCallback(e) {
    var eventData = e.detail;

    var toolData = getToolState(eventData.element, toolType);
    if (toolData && toolData.data) {
        toolData.data = [];
    }

    $(eventData.element).off('CornerstoneToolsMouseMove', dragCallback);
    $(eventData.element).off('CornerstoneToolsMouseDrag', dragCallback);

    $(eventData.element).off('CornerstoneToolsMouseUp', dragEndCallback);
    $(eventData.element).off('CornerstoneToolsMouseClick', dragEndCallback);

    var mouseData = {
        mouseButtonMask: currentMouseButtonMask
    };

    $(eventData.element).on('CornerstoneToolsMouseDown', mouseData, mouseDownCallback);
}

/* Applies the windowing procedure when the mouse drag ends */
function dragEndCallback(e, eventData) {
    $(eventData.element).off('CornerstoneToolsMouseMove', dragCallback);
    $(eventData.element).off('CornerstoneToolsMouseDrag', dragCallback);

    $(eventData.element).off('CornerstoneToolsMouseUp', dragEndCallback);
    $(eventData.element).off('CornerstoneToolsMouseClick', dragEndCallback);

    var mouseData = {
        mouseButtonMask: currentMouseButtonMask
    };

    $(eventData.element).on('CornerstoneToolsMouseDown', mouseData, mouseDownCallback);

    var toolData = getToolState(eventData.element, toolType);
    if (!toolData || !toolData.data || !toolData.data.length) {
        return;
    }

    // Update the endpoint as the mouse/touch is dragged
    toolData.data[0].endPoint = {
        x: eventData.currentPoints.image.x,
        y: eventData.currentPoints.image.y
    };

    applyWWWCRegion(eventData);
}

/** Calculates the minimum and maximum value in the given pixel array */
function applyWWWCRegion(eventData) {
    var toolData = getToolState(eventData.element, toolType);
    if (!toolData || !toolData.data || !toolData.data.length) {
        return;
    }

    var startPoint = toolData.data[0].startPoint;
    var endPoint = toolData.data[0].endPoint;

    // Get the rectangular region defined by the handles
    var width = Math.abs(startPoint.x - endPoint.x);
    var height = Math.abs(startPoint.y - endPoint.y);

    var left = Math.min(startPoint.x, endPoint.x);
    var top = Math.min(startPoint.y, endPoint.y);

    // Bound the rectangle so we don't get undefined pixels
    left = Math.max(left, 0);
    left = Math.min(left, eventData.image.width);
    top = Math.max(top, 0);
    top = Math.min(top, eventData.image.height);
    width = Math.floor(Math.min(width, Math.abs(eventData.image.width - left)));
    height = Math.floor(Math.min(height, Math.abs(eventData.image.height - top)));

    // Get the pixel data in the rectangular region
    var pixelLuminanceData = getLuminance(eventData.element, left, top, width, height);

    // Calculate the minimum and maximum pixel values
    var minMaxMean = calculateMinMaxMean(pixelLuminanceData, eventData.image.minPixelValue, eventData.image.maxPixelValue);

    // Adjust the viewport window width and center based on the calculated values
    var config = wwwcRegion.getConfiguration();
    var viewport = cornerstone.getViewport(eventData.element);
    if (config.minWindowWidth === undefined) {
        config.minWindowWidth = 10;
    }

    viewport.voi.windowWidth = Math.max(Math.abs(minMaxMean.max - minMaxMean.min), config.minWindowWidth);
    viewport.voi.windowCenter = minMaxMean.mean;
    cornerstone.setViewport(eventData.element, viewport);

    // Clear the toolData
    toolData.data = [];

    cornerstone.updateImage(eventData.element);
}

function whichMovement(e, eventData) {
    var element = eventData.element;

    $(element).off('CornerstoneToolsMouseMove');
    $(element).off('CornerstoneToolsMouseDrag');

    $(element).on('CornerstoneToolsMouseMove', dragCallback);
    $(element).on('CornerstoneToolsMouseDrag', dragCallback);

    $(element).on('CornerstoneToolsMouseClick', dragEndCallback);
    if (e.type === 'CornerstoneToolsMouseDrag') {
        $(element).on('CornerstoneToolsMouseUp', dragEndCallback);
    }
}

/** Records the start point and attaches the drag event handler */
function mouseDownCallback(e, eventData) {
    if (isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
        $(eventData.element).on('CornerstoneToolsMouseDrag', eventData, whichMovement);
        $(eventData.element).on('CornerstoneToolsMouseMove', eventData, whichMovement);

        $(eventData.element).off('CornerstoneToolsMouseDown', mouseDownCallback);
        recordStartPoint(eventData);
        return false;
    }
}

/** Records the start point of the click or touch */
function recordStartPoint(eventData) {
    var toolData = getToolState(eventData.element, toolType);
    if (toolData && toolData.data) {
        toolData.data = [];
    }

    var measurementData = {
        startPoint: {
            x: eventData.currentPoints.image.x,
            y: eventData.currentPoints.image.y
        }
    };

    addToolState(eventData.element, toolType, measurementData);
}

/** Draws the rectangular region while the touch or mouse event drag occurs */
function dragCallback(e, eventData) {
    // if we have no toolData for this element, return immediately as there is nothing to do
    var toolData = getToolState(eventData.element, toolType);
    if (!toolData || !toolData.data || !toolData.data.length) {
        return;
    }

    // Update the endpoint as the mouse/touch is dragged
    var endPoint = {
        x: eventData.currentPoints.image.x,
        y: eventData.currentPoints.image.y
    };

    toolData.data[0].endPoint = endPoint;
    cornerstone.updateImage(eventData.element);
}

function onImageRendered(e) {
    var eventData = e.detail;
    var toolData = getToolState(eventData.element, toolType);
    if (!toolData || !toolData.data || !toolData.data.length) {
        return;
    }

    var startPoint = toolData.data[0].startPoint;
    var endPoint = toolData.data[0].endPoint;

    if (!startPoint || !endPoint) {
        return;
    }

    // Get the current element's canvas
    var canvas = $(eventData.element).find('canvas').get(0);
    var context = canvas.getContext('2d');
    context.setTransform(1, 0, 0, 1, 0, 0);

    // Set to the active tool color
    var color = toolColors.getActiveColor();

    // Calculate the rectangle parameters
    var startPointCanvas = cornerstone.pixelToCanvas(eventData.element, startPoint);
    var endPointCanvas = cornerstone.pixelToCanvas(eventData.element, endPoint);

    var left = Math.min(startPointCanvas.x, endPointCanvas.x);
    var top = Math.min(startPointCanvas.y, endPointCanvas.y);
    var width = Math.abs(startPointCanvas.x - endPointCanvas.x);
    var height = Math.abs(startPointCanvas.y - endPointCanvas.y);

    var lineWidth = toolStyle.getToolWidth();
    var config = wwwcRegion.getConfiguration();

    // Draw the rectangle
    context.save();

    if (config && config.shadow) {
        context.shadowColor = config.shadowColor || '#000000';
        context.shadowOffsetX = config.shadowOffsetX || 1;
        context.shadowOffsetY = config.shadowOffsetY || 1;
    }

    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.rect(left, top, width, height);
    context.stroke();

    context.restore();
}

// --- Mouse tool enable / disable --- ///
function disable(element) {
    $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);

    $(element).off('CornerstoneToolsMouseUp', dragEndCallback);
    $(element).off('CornerstoneToolsMouseClick', dragEndCallback);

    $(element).off('CornerstoneToolsMouseDrag', dragCallback);
    $(element).off('CornerstoneToolsMouseMove', dragCallback);

    element.removeEventListener('CornerstoneImageRendered', onImageRendered);
    element.removeEventListener('CornerstoneNewImage', newImageCallback);

    cornerstone.updateImage(element);
}

function activate(element, mouseButtonMask) {
    var eventData = {
        mouseButtonMask: mouseButtonMask,
    };

    currentMouseButtonMask = mouseButtonMask;

    var toolData = getToolState(element, toolType);
    if (!toolData) {
        var data = [];
        addToolState(element, toolType, data);
    }

    $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);

    $(element).off('CornerstoneToolsMouseUp', dragEndCallback);
    $(element).off('CornerstoneToolsMouseClick', dragEndCallback);

    $(element).off('CornerstoneToolsMouseDrag', dragCallback);
    $(element).off('CornerstoneToolsMouseMove', dragCallback);

    element.removeEventListener('CornerstoneImageRendered', onImageRendered);
    element.removeEventListener('CornerstoneNewImage', newImageCallback);

    $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);
    element.addEventListener('CornerstoneImageRendered', onImageRendered);

    // If the displayed image changes after the user has started clicking, we should
    // cancel the handlers and prepare for another click
    element.addEventListener('CornerstoneNewImage', newImageCallback);

    cornerstone.updateImage(element);
}

// --- Touch tool enable / disable --- //
function disableTouchDrag(element) {
    $(element).off('CornerstoneToolsTouchDrag', dragCallback);
    $(element).off('CornerstoneToolsTouchStart', recordStartPoint);
    $(element).off('CornerstoneToolsDragEnd', applyWWWCRegion);
    element.removeEventListener('CornerstoneImageRendered', onImageRendered);
}

function activateTouchDrag(element) {
    var toolData = getToolState(element, toolType);
    if (!toolData) {
        var data = [];
        addToolState(element, toolType, data);
    }

    $(element).off('CornerstoneToolsTouchDrag', dragCallback);
    $(element).off('CornerstoneToolsTouchStart', recordStartPoint);
    $(element).off('CornerstoneToolsDragEnd', applyWWWCRegion);
    element.removeEventListener('CornerstoneImageRendered', onImageRendered);

    $(element).on('CornerstoneToolsTouchDrag', dragCallback);
    $(element).on('CornerstoneToolsTouchStart', recordStartPoint);
    $(element).on('CornerstoneToolsDragEnd', applyWWWCRegion);
    element.addEventListener('CornerstoneImageRendered', onImageRendered);
}

function getConfiguration() {
    return configuration;
}

function setConfiguration(config) {
    configuration = config;
}

// module exports
const wwwcRegion = {
    activate: activate,
    deactivate: disable,
    disable: disable,
    setConfiguration: setConfiguration,
    getConfiguration: getConfiguration
};

const wwwcRegionTouch = {
    activate: activateTouchDrag,
    deactivate: disableTouchDrag,
    disable: disableTouchDrag
};

export {
  wwwcRegion,
  wwwcRegionTouch
};