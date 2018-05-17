import external from '../externalModules.js';
import orientation from '../orientation/index.js';
import displayTool from './displayTool.js';
import toolColors from '../stateManagement/toolColors.js';
import drawTextBox, { textBoxWidth } from '../util/drawTextBox.js';
import { getNewContext } from '../util/drawing.js';

function getOrientationMarkers (element) {
  const cornerstone = external.cornerstone;
  const enabledElement = cornerstone.getEnabledElement(element);
  const imagePlaneMetaData = cornerstone.metaData.get('imagePlaneModule', enabledElement.image.imageId);

  if (!imagePlaneMetaData || !imagePlaneMetaData.rowCosines || !imagePlaneMetaData.columnCosines) {
    return;
  }

  const rowString = orientation.getOrientationString(imagePlaneMetaData.rowCosines);
  const columnString = orientation.getOrientationString(imagePlaneMetaData.columnCosines);

  const oppositeRowString = orientation.invertOrientationString(rowString);
  const oppositeColumnString = orientation.invertOrientationString(columnString);

  return {
    top: oppositeColumnString,
    bottom: columnString,
    left: oppositeRowString,
    right: rowString
  };
}

function getOrientationMarkerPositions (element) {
  const cornerstone = external.cornerstone;
  const enabledElement = cornerstone.getEnabledElement(element);
  const top = {
    x: enabledElement.image.width / 2,
    y: 5
  };
  const bottom = {
    x: enabledElement.image.width / 2,
    y: enabledElement.image.height - 5
  };
  const left = {
    x: 5,
    y: enabledElement.image.height / 2
  };
  const right = {
    x: enabledElement.image.width - 10,
    y: enabledElement.image.height / 2
  };

  return {
    top,
    bottom,
    left,
    right
  };
}

function onImageRendered (e) {
  const eventData = e.detail;
  const element = eventData.element;

  const markers = getOrientationMarkers(element);

  if (!markers) {
    return;
  }

  const coords = getOrientationMarkerPositions(element, markers);
  const context = getNewContext(eventData.canvasContext.canvas);
  const color = toolColors.getToolColor();
  const textWidths = {
    top: textBoxWidth(context, markers.top, 0),
    left: textBoxWidth(context, markers.left, 0),
    right: textBoxWidth(context, markers.right, 0),
    bottom: textBoxWidth(context, markers.bottom, 0)
  };

  drawTextBox(context, eventData.element, markers.top, coords.top, -textWidths.top / 2, 0, color);
  drawTextBox(context, eventData.element, markers.left, coords.left, -textWidths.left / 2, 0, color);

  const config = orientationMarkers.getConfiguration();

  if (config && config.drawAllMarkers) {
    drawTextBox(context, eventData.element, markers.right, coords.right, -textWidths.right / 2, 0, color);
    drawTextBox(context, eventData.element, markers.bottom, coords.bottom, -textWidths.bottom / 2, 0, color);
  }
}
// /////// END IMAGE RENDERING ///////

// Module exports
const orientationMarkers = displayTool(onImageRendered);

export default orientationMarkers;
