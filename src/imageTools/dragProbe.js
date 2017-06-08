import * as cornerstone from 'cornerstone-core';
import simpleMouseButtonTool from './simpleMouseButtonTool.js';
import touchDragTool from './touchDragTool.js';
import textStyle from '../stateManagement/textStyle.js';
import toolColors from '../stateManagement/toolColors.js';
import drawTextBox from '../util/drawTextBox';
import getRGBPixels from '../util/getRGBPixels';
import calculateSUV from '../util/calculateSUV';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled';

let dragEventData;

function defaultStrategy (eventData) {
  const enabledElement = cornerstone.getEnabledElement(eventData.element);

  const context = enabledElement.canvas.getContext('2d');

  context.setTransform(1, 0, 0, 1, 0, 0);

  const color = toolColors.getActiveColor();
  const font = textStyle.getFont();
  const fontHeight = textStyle.getFontSize();
  const config = dragProbe.getConfiguration();

  context.save();

  if (config && config.shadow) {
    context.shadowColor = config.shadowColor || '#000000';
    context.shadowOffsetX = config.shadowOffsetX || 1;
    context.shadowOffsetY = config.shadowOffsetY || 1;
  }

  const x = Math.round(eventData.currentPoints.image.x);
  const y = Math.round(eventData.currentPoints.image.y);

  let storedPixels;
  let text,
    str;

  if (x < 0 || y < 0 || x >= eventData.image.columns || y >= eventData.image.rows) {
    return;
  }

  if (eventData.image.color) {
    storedPixels = getRGBPixels(eventData.element, x, y, 1, 1);
    text = `${x}, ${y}`;
    str = `R: ${storedPixels[0]} G: ${storedPixels[1]} B: ${storedPixels[2]} A: ${storedPixels[3]}`;
  } else {
    storedPixels = cornerstone.getStoredPixels(eventData.element, x, y, 1, 1);
    const sp = storedPixels[0];
    const mo = sp * eventData.image.slope + eventData.image.intercept;
    const suv = calculateSUV(eventData.image, sp);

        // Draw text
    text = `${x}, ${y}`;
    str = `SP: ${sp} MO: ${parseFloat(mo.toFixed(3))}`;
    if (suv) {
      str += ` SUV: ${parseFloat(suv.toFixed(3))}`;
    }
  }

    // Draw text
  const coords = {
        // Translate the x/y away from the cursor
    x: eventData.currentPoints.image.x + 3,
    y: eventData.currentPoints.image.y - 3
  };
  const textCoords = cornerstone.pixelToCanvas(eventData.element, coords);

  context.font = font;
  context.fillStyle = color;

  drawTextBox(context, str, textCoords.x, textCoords.y + fontHeight + 5, color);
  drawTextBox(context, text, textCoords.x, textCoords.y, color);
  context.restore();
}

function minimalStrategy (eventData) {
  const element = eventData.element;
  const enabledElement = cornerstone.getEnabledElement(element);
  const image = enabledElement.image;

  const context = enabledElement.canvas.getContext('2d');

  context.setTransform(1, 0, 0, 1, 0, 0);

  const color = toolColors.getActiveColor();
  const font = textStyle.getFont();
  const config = dragProbe.getConfiguration();

  context.save();

  if (config && config.shadow) {
    context.shadowColor = config.shadowColor || '#000000';
    context.shadowOffsetX = config.shadowOffsetX || 1;
    context.shadowOffsetY = config.shadowOffsetY || 1;
  }

  const seriesModule = cornerstone.metaData.get('generalSeriesModule', image.imageId);
  let modality;

  if (seriesModule) {
    modality = seriesModule.modality;
  }

  let toolCoords;

  if (eventData.isTouchEvent === true) {
    toolCoords = cornerstone.pageToPixel(element, eventData.currentPoints.page.x,
            eventData.currentPoints.page.y - textStyle.getFontSize() * 4);
  } else {
    toolCoords = cornerstone.pageToPixel(element, eventData.currentPoints.page.x,
            eventData.currentPoints.page.y - textStyle.getFontSize() / 2);
  }

  let storedPixels;
  let text = '';

  if (toolCoords.x < 0 || toolCoords.y < 0 ||
        toolCoords.x >= image.columns || toolCoords.y >= image.rows) {
    return;
  }

  if (image.color) {
    storedPixels = getRGBPixels(element, toolCoords.x, toolCoords.y, 1, 1);
    text = `R: ${storedPixels[0]} G: ${storedPixels[1]} B: ${storedPixels[2]}`;
  } else {
    storedPixels = cornerstone.getStoredPixels(element, toolCoords.x, toolCoords.y, 1, 1);
    const sp = storedPixels[0];
    const mo = sp * eventData.image.slope + eventData.image.intercept;

    const modalityPixelValueText = parseFloat(mo.toFixed(2));

    if (modality === 'CT') {
      text += `HU: ${modalityPixelValueText}`;
    } else if (modality === 'PT') {
      text += modalityPixelValueText;
      const suv = calculateSUV(eventData.image, sp);

      if (suv) {
        text += ` SUV: ${parseFloat(suv.toFixed(2))}`;
      }
    } else {
      text += modalityPixelValueText;
    }
  }

    // Prepare text
  const textCoords = cornerstone.pixelToCanvas(element, toolCoords);

  context.font = font;
  context.fillStyle = color;

    // Translate the x/y away from the cursor
  let translation;
  const handleRadius = 6;
  const width = context.measureText(text).width;

  if (eventData.isTouchEvent === true) {
    translation = {
      x: -width / 2 - 5,
      y: -textStyle.getFontSize() - 10 - 2 * handleRadius
    };
  } else {
    translation = {
      x: 12,
      y: -(textStyle.getFontSize() + 10) / 2
    };
  }

  context.beginPath();
  context.strokeStyle = color;
  context.arc(textCoords.x, textCoords.y, handleRadius, 0, 2 * Math.PI);
  context.stroke();

  drawTextBox(context, text, textCoords.x + translation.x, textCoords.y + translation.y, color);
  context.restore();
}

function mouseUpCallback (e, eventData) {
  const element = eventData.element;

  $(element).off('CornerstoneImageRendered', imageRenderedCallback);
  $(element).off('CornerstoneToolsMouseDrag', dragCallback);
  $(element).off('CornerstoneToolsMouseUp', mouseUpCallback);
  $(element).off('CornerstoneToolsMouseClick', mouseUpCallback);
  cornerstone.updateImage(eventData.element);
}

function mouseDownCallback (e, eventData) {
  const element = eventData.element;

  if (isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
    $(element).on('CornerstoneImageRendered', imageRenderedCallback);
    $(element).on('CornerstoneToolsMouseDrag', dragCallback);
    $(element).on('CornerstoneToolsMouseUp', mouseUpCallback);
    $(element).on('CornerstoneToolsMouseClick', mouseUpCallback);
    dragProbe.strategy(eventData);

    return false; // False = causes jquery to preventDefault() and stopPropagation() this event
  }
}

function imageRenderedCallback () {
  if (dragEventData) {
    dragProbe.strategy(dragEventData);
    dragEventData = null;
  }
}

// The strategy can't be execute at this moment because the image is rendered asynchronously
// (requestAnimationFrame). Then the eventData that contains all information needed is being
// Cached and the strategy will be executed once CornerstoneImageRendered is triggered.
function dragCallback (e, eventData) {
  const element = eventData.element;

  dragEventData = eventData;
  cornerstone.updateImage(element);

  return false; // False = causes jquery to preventDefault() and stopPropagation() this event
}

const dragProbe = simpleMouseButtonTool(mouseDownCallback);

dragProbe.strategies = {
  default: defaultStrategy,
  minimal: minimalStrategy
};

dragProbe.strategy = defaultStrategy;

const options = {
  fireOnTouchStart: true
};

const dragProbeTouch = touchDragTool(dragCallback, options);

export {
  dragProbe,
  dragProbeTouch
};
