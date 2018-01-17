import external from '../externalModules.js';
import orientation from '../orientation/index.js';
import displayTool from './displayTool.js';
import toolColors from '../stateManagement/toolColors.js';
import drawTextBox from '../util/drawTextBox.js';

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
  let coords;

  coords = {
    x: enabledElement.image.width / 2,
    y: 5
  };
  const top = cornerstone.pixelToCanvas(element, coords);

  coords = {
    x: enabledElement.image.width / 2,
    y: enabledElement.image.height - 5
  };
  const bottom = cornerstone.pixelToCanvas(element, coords);

  coords = {
    x: 5,
    y: enabledElement.image.height / 2
  };
  const left = cornerstone.pixelToCanvas(element, coords);

  coords = {
    x: enabledElement.image.width - 10,
    y: enabledElement.image.height / 2
  };
  const right = cornerstone.pixelToCanvas(element, coords);

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

  const context = eventData.canvasContext.canvas.getContext('2d');

  context.setTransform(1, 0, 0, 1, 0, 0);

  const color = toolColors.getToolColor();

  const textWidths = {
    top: context.measureText(markers.top).width,
    left: context.measureText(markers.left).width,
    right: context.measureText(markers.right).width,
    bottom: context.measureText(markers.bottom).width
  };

  drawTextBox(context, markers.top, coords.top.x - textWidths.top / 2, coords.top.y, color);
  drawTextBox(context, markers.left, coords.left.x - textWidths.left / 2, coords.left.y, color);

  const config = orientationMarkers.getConfiguration();

  if (config && config.drawAllMarkers) {
    drawTextBox(context, markers.right, coords.right.x - textWidths.right / 2, coords.right.y, color);
    drawTextBox(context, markers.bottom, coords.bottom.x - textWidths.bottom / 2, coords.bottom.y, color);
  }
}
// /////// END IMAGE RENDERING ///////

// Module exports
const orientationMarkers = displayTool(onImageRendered);

export default orientationMarkers;
