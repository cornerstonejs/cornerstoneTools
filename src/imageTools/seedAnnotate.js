/* eslint no-alert:0 */
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneMath from 'cornerstone-math';
import mouseButtonTool from './mouseButtonTool.js';
import touchTool from './touchTool';
import drawTextBox from '../util/drawTextBox.js';
import textStyle from '../stateManagement/textStyle.js';
import toolStyle from '../stateManagement/toolStyle.js';
import toolColors from '../stateManagement/toolColors.js';
import anyHandlesOutsideImage from '../manipulators/anyHandlesOutsideImage.js';
import moveHandle from '../manipulators/moveHandle';
import drawHandles from '../manipulators/drawHandles';
import drawCircle from '../util/drawCircle';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled';
import pointInsideBoundingBox from '../util/pointInsideBoundingBox';
import { addToolState, removeToolState, getToolState } from '../stateManagement/toolState.js';

const toolType = 'seedAnnotate';

// Define a callback to get your text annotation
// This could be used, e.g. to open a modal
function getTextCallback (doneGetTextCallback) {
  doneGetTextCallback(prompt('Enter your annotation:'));
}

function changeTextCallback (data, eventData, doneChangingTextCallback) {
  doneChangingTextCallback(prompt('Change your annotation:'));
}

const configuration = {
  getTextCallback,
  changeTextCallback,
  drawHandles: false,
  drawHandlesOnHover: true,
  currentLetter: 'A',
  currentNumber: 0,
  showCoordinates: true,
  countUp: true
};
// / --- Mouse Tool --- ///

// /////// BEGIN ACTIVE TOOL ///////
function addNewMeasurement (mouseEventData) {
  const element = mouseEventData.element;
  const config = seedAnnotate.getConfiguration();
  const measurementData = createNewMeasurement(mouseEventData);

  function doneGetTextCallback (text) {
    if (text === null) {
      removeToolState(element, toolType, measurementData);
    } else {
      measurementData.text = text;
    }

    measurementData.active = false;
    cornerstone.updateImage(element);
  }

    // Associate this data with this imageId so we can render it and manipulate it
  addToolState(element, toolType, measurementData);

  cornerstone.updateImage(element);
  moveHandle(mouseEventData, toolType, measurementData, measurementData.handles.end, function () {
    if (anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
            // Delete the measurement
      removeToolState(element, toolType, measurementData);
    }

    if (measurementData.text === undefined) {
      config.getTextCallback(doneGetTextCallback);
    }

    cornerstone.updateImage(element);
  });
}

function createNewMeasurement (mouseEventData) {
    // Create the measurement data for this tool with the end handle activated
  const measurementData = {
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
// /////// END ACTIVE TOOL ///////

function pointNearTool (element, data, coords) {
  if (!data.handles.end) {
    return;
  }

  const realCoords = cornerstone.pixelToCanvas(element, data.handles.end);
  const distanceToPoint = cornerstoneMath.point.distance(realCoords, coords);


  return (distanceToPoint < 25);
}

// /////// BEGIN IMAGE RENDERING ///////
function onImageRendered (e, eventData) {
  // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = getToolState(e.currentTarget, toolType);

  if (!toolData) {
    return;
  }

  const enabledElement = eventData.enabledElement;

    // We have tool data for this element - iterate over each one and draw it
  const context = eventData.canvasContext.canvas.getContext('2d');

  context.setTransform(1, 0, 0, 1, 0, 0);

    // We need the canvas width
  const canvasWidth = eventData.canvasContext.canvas.width;

  let color;
  const lineWidth = toolStyle.getToolWidth();
  const font = textStyle.getFont();
  const config = seedAnnotate.getConfiguration();

  for (let i = 0; i < toolData.data.length; i++) {
    context.save();

    if (config && config.shadow) {
      context.shadowColor = config.shadowColor || '#000000';
      context.shadowOffsetX = config.shadowOffsetX || 1;
      context.shadowOffsetY = config.shadowOffsetY || 1;
    }

    const data = toolData.data[i];

    if (data.active) {
      color = toolColors.getActiveColor();
    } else {
      color = toolColors.getToolColor();
    }

        // Draw
    const handleCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.end);

        // Draw the circle always at the end of the handle
    drawCircle(context, handleCanvas, color, lineWidth);

    const handleOptions = {
      drawHandlesIfActive: (config && config.drawHandlesOnHover)
    };

    if (config.drawHandles) {
      drawHandles(context, eventData, handleCanvas, color, handleOptions);
    }

        // Draw the text
    if (data.text && data.text !== '') {
      context.font = font;

      let textPlusCoords = '';

      if (config.showCoordinates) {
        textPlusCoords = `${data.text} x: ${Math.round(data.handles.end.x)
                } y: ${Math.round(data.handles.end.y)}`;
      } else {
        textPlusCoords = data.text;
      }

            // Calculate the text coordinates.
      const textWidth = context.measureText(textPlusCoords).width + 10;
      const textHeight = textStyle.getFontSize() + 10;

      let distance = Math.max(textWidth, textHeight) / 2 + 5;

      if (handleCanvas.x > (canvasWidth / 2)) {
        distance = -distance;
      }

      let textCoords;

      if (!data.handles.textBox.hasMoved) {
        textCoords = {
          x: handleCanvas.x - textWidth / 2 + distance,
          y: handleCanvas.y - textHeight / 2
        };

        const transform = cornerstone.internal.getTransform(enabledElement);

        transform.invert();

        const coords = transform.transformPoint(textCoords.x, textCoords.y);

        data.handles.textBox.x = coords.x;
        data.handles.textBox.y = coords.y;
      }

      textCoords = cornerstone.pixelToCanvas(eventData.element, data.handles.textBox);

      const boundingBox = drawTextBox(context, textPlusCoords, textCoords.x, textCoords.y, color);

      data.handles.textBox.boundingBox = boundingBox;

      if (data.handles.textBox.hasMoved) {
                // Draw dashed link line between tool and text
        const link = {
          start: {},
          end: {}
        };

        link.end.x = textCoords.x;
        link.end.y = textCoords.y;

        link.start = handleCanvas;

        const boundingBoxPoints = [
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
          }
        ];

        link.end = cornerstoneMath.point.findClosestPoint(boundingBoxPoints, link.start);

        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.setLineDash([2, 3]);
        context.moveTo(link.start.x, link.start.y);
        context.lineTo(link.end.x, link.end.y);
        context.stroke();
      }
    }

    context.restore();
  }
}
// ---- Touch tool ----

// /////// BEGIN ACTIVE TOOL ///////
function addNewMeasurementTouch (touchEventData) {
  const element = touchEventData.element;
  const config = seedAnnotate.getConfiguration();
  const measurementData = createNewMeasurement(touchEventData);

  function doneGetTextCallback (text) {
    if (text === null) {
      removeToolState(element, toolType, measurementData);
    } else {
      measurementData.text = text;
    }

    measurementData.active = false;
    cornerstone.updateImage(element);
  }

    // Associate this data with this imageId so we can render it and manipulate it
  addToolState(element, toolType, measurementData);

  cornerstone.updateImage(element);
  moveHandle(touchEventData, toolType, measurementData, measurementData.handles.end, function () {
    if (anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
            // Delete the measurement
      removeToolState(element, toolType, measurementData);
    }

    if (measurementData.text === undefined) {
      config.getTextCallback(doneGetTextCallback);
    }

    cornerstone.updateImage(element);
  });
}

function doubleClickCallback (e, eventData) {
  const element = eventData.element;
  let data;

  function doneChangingTextCallback (data, updatedText, deleteTool) {
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

  const config = seedAnnotate.getConfiguration();

  const coords = eventData.currentPoints.canvas;
  const toolData = getToolState(element, toolType);

    // Now check to see if there is a handle we can move
  if (!toolData) {
    return;
  }

  for (let i = 0; i < toolData.data.length; i++) {
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

  return false; // False = causes jquery to preventDefault() and stopPropagation() this event
}

function pressCallback (e, eventData) {
  const element = eventData.element;
  let data;

  function doneChangingTextCallback (data, updatedText, deleteTool) {
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

  const config = seedAnnotate.getConfiguration();

  const coords = eventData.currentPoints.canvas;
  const toolData = getToolState(element, toolType);

    // Now check to see if there is a handle we can move
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

  for (let i = 0; i < toolData.data.length; i++) {
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

  return false; // False = causes jquery to preventDefault() and stopPropagation() this event
}

const seedAnnotate = mouseButtonTool({
  addNewMeasurement,
  createNewMeasurement,
  onImageRendered,
  pointNearTool,
  toolType,
  mouseDoubleClickCallback: doubleClickCallback
});

seedAnnotate.setConfiguration(configuration);

const seedAnnotateTouch = touchTool({
  addNewMeasurement: addNewMeasurementTouch,
  createNewMeasurement,
  onImageRendered,
  pointNearTool,
  toolType,
  pressCallback
});

export {
  seedAnnotate,
  seedAnnotateTouch
};
