import orientation from '../orientation/index.js';
import displayTool from './displayTool.js';
import { metaData } from '../metaData.js';

function getOrientationMarkers(element) {
    var enabledElement = cornerstone.getEnabledElement(element);
    var imagePlaneMetaData = metaData.get('imagePlane', enabledElement.image.imageId);

    if (!imagePlaneMetaData || !imagePlaneMetaData.rowCosines || !imagePlaneMetaData.columnCosines) {
        return;
    }

    var rowString = orientation.getOrientationString(imagePlaneMetaData.rowCosines);
    var columnString = orientation.getOrientationString(imagePlaneMetaData.columnCosines);

    var oppositeRowString = orientation.invertOrientationString(rowString);
    var oppositeColumnString = orientation.invertOrientationString(columnString);

    return {
        top: oppositeColumnString,
        bottom: columnString,
        left: oppositeRowString,
        right: rowString
    };
}

function getOrientationMarkerPositions(element) {
    var enabledElement = cornerstone.getEnabledElement(element);
    var coords;

    coords = {
        x: enabledElement.image.width / 2,
        y: 5
    };
    var topCoords = cornerstone.pixelToCanvas(element, coords);

    coords = {
        x: enabledElement.image.width / 2,
        y: enabledElement.image.height - 5
    };
    var bottomCoords = cornerstone.pixelToCanvas(element, coords);

    coords = {
        x: 5,
        y: enabledElement.image.height / 2
    };
    var leftCoords = cornerstone.pixelToCanvas(element, coords);

    coords = {
        x: enabledElement.image.width - 10,
        y: enabledElement.image.height / 2
    };
    var rightCoords = cornerstone.pixelToCanvas(element, coords);

    return {
        top: topCoords,
        bottom: bottomCoords,
        left: leftCoords,
        right: rightCoords
    };
}

function onImageRendered(e) {
    var eventData = e.detail;
    var element = eventData.element;

    var markers = getOrientationMarkers(element);

    if (!markers) {
        return;
    }

    var coords = getOrientationMarkerPositions(element, markers);

    var context = eventData.canvasContext.canvas.getContext('2d');
    context.setTransform(1, 0, 0, 1, 0, 0);

    var color = toolColors.getToolColor();

    var textWidths = {
        top: context.measureText(markers.top).width,
        left: context.measureText(markers.left).width,
        right: context.measureText(markers.right).width,
        bottom: context.measureText(markers.bottom).width
    };

    drawTextBox(context, markers.top, coords.top.x - textWidths.top / 2, coords.top.y, color);
    drawTextBox(context, markers.left, coords.left.x - textWidths.left / 2, coords.left.y, color);

    var config = orientationMarkers.getConfiguration();
    if (config && config.drawAllMarkers) {
        drawTextBox(context, markers.right, coords.right.x - textWidths.right / 2, coords.right.y, color);
        drawTextBox(context, markers.bottom, coords.bottom.x - textWidths.bottom / 2, coords.bottom.y, color);
    }
}
///////// END IMAGE RENDERING ///////

// module exports
const orientationMarkers = displayTool(onImageRendered);

export default orientationMarkers;
