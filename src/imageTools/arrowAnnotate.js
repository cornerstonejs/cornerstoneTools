/* eslint no-alert:0 */
import { cornerstoneMath, external } from '../externalModules.js';
import mouseButtonTool from './mouseButtonTool.js';
import touchTool from './touchTool.js';
import drawTextBox from '../util/drawTextBox.js';
import toolStyle from '../stateManagement/toolStyle.js';
import textStyle from '../stateManagement/textStyle.js';
import toolColors from '../stateManagement/toolColors.js';
import drawHandles from '../manipulators/drawHandles.js';
import drawArrow from '../util/drawArrow.js';
import moveNewHandle from '../manipulators/moveNewHandle.js';
import moveNewHandleTouch from '../manipulators/moveNewHandleTouch.js';
import anyHandlesOutsideImage from '../manipulators/anyHandlesOutsideImage.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import pointInsideBoundingBox from '../util/pointInsideBoundingBox.js';
import { addToolState, removeToolState, getToolState } from '../stateManagement/toolState.js';

const toolType = 'arrowAnnotate';

// Define a callback to get your text annotation
// This could be used, e.g. to open a modal
function getTextCallback (doneChangingTextCallback) {
  doneChangingTextCallback(prompt('Enter your annotation:'));
}

function changeTextCallback (data, eventData, doneChangingTextCallback) {
  doneChangingTextCallback(prompt('Change your annotation:'));
}

const configuration = {
  getTextCallback,
  changeTextCallback,
  drawHandles: false,
  drawHandlesOnHover: true,
  arrowFirst: true
};

// / --- Mouse Tool --- ///

// /////// BEGIN ACTIVE TOOL ///////
function addNewMeasurement (mouseEventData) {
  const measurementData = createNewMeasurement(mouseEventData);
  const cornerstone = external.cornerstone;

  const eventData = {
    mouseButtonMask: mouseEventData.which
  };

  function doneChangingTextCallback (text) {
    if (text === null) {
      removeToolState(mouseEventData.element, toolType, measurementData);
    } else {
      measurementData.text = text;
    }

    measurementData.active = false;
    cornerstone.updateImage(mouseEventData.element);

    external.$(mouseEventData.element).on('CornerstoneToolsMouseMove', eventData, arrowAnnotate.mouseMoveCallback);
    external.$(mouseEventData.element).on('CornerstoneToolsMouseDown', eventData, arrowAnnotate.mouseDownCallback);
    external.$(mouseEventData.element).on('CornerstoneToolsMouseDownActivate', eventData, arrowAnnotate.mouseDownActivateCallback);
    external.$(mouseEventData.element).on('CornerstoneToolsMouseDoubleClick', eventData, arrowAnnotate.mouseDoubleClickCallback);
  }

  // Associate this data with this imageId so we can render it and manipulate it
  addToolState(mouseEventData.element, toolType, measurementData);

  // Since we are dragging to another place to drop the end point, we can just activate
  // The end point and let the moveHandle move it for us.
  external.$(mouseEventData.element).off('CornerstoneToolsMouseMove', arrowAnnotate.mouseMoveCallback);
  external.$(mouseEventData.element).off('CornerstoneToolsMouseDown', arrowAnnotate.mouseDownCallback);
  external.$(mouseEventData.element).off('CornerstoneToolsMouseDownActivate', arrowAnnotate.mouseDownActivateCallback);
  external.$(mouseEventData.element).off('CornerstoneToolsMouseDoubleClick', arrowAnnotate.mouseDoubleClickCallback);

  cornerstone.updateImage(mouseEventData.element);
  moveNewHandle(mouseEventData, toolType, measurementData, measurementData.handles.end, function () {
    if (anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
      // Delete the measurement
      removeToolState(mouseEventData.element, toolType, measurementData);
    }

    const config = arrowAnnotate.getConfiguration();

    if (measurementData.text === undefined) {
      config.getTextCallback(doneChangingTextCallback);
    }

    cornerstone.updateImage(mouseEventData.element);
  });
}

function createNewMeasurement (mouseEventData) {
  // Create the measurement data for this tool with the end handle activated
  const measurementData = {
    visible: true,
    active: true,
    handles: {
      start: {
        x: mouseEventData.currentPoints.image.x,
        y: mouseEventData.currentPoints.image.y,
        highlight: true,
        active: false
      },
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
  const cornerstone = external.cornerstone;

  const lineSegment = {
    start: cornerstone.pixelToCanvas(element, data.handles.start),
    end: cornerstone.pixelToCanvas(element, data.handles.end)
  };

  const distanceToPoint = cornerstoneMath.lineSegment.distanceToPoint(lineSegment, coords);


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
  const cornerstone = external.cornerstone;

  // We have tool data for this element - iterate over each one and draw it
  const context = eventData.canvasContext.canvas.getContext('2d');

  context.setTransform(1, 0, 0, 1, 0, 0);

  let color;
  const lineWidth = toolStyle.getToolWidth();
  const font = textStyle.getFont();
  const config = arrowAnnotate.getConfiguration();

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

    // Draw the arrow
    const handleStartCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.start);
    const handleEndCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.end);

    // Config.arrowFirst = false;
    if (config.arrowFirst) {
      drawArrow(context, handleEndCanvas, handleStartCanvas, color, lineWidth);
    } else {
      drawArrow(context, handleStartCanvas, handleEndCanvas, color, lineWidth);
    }

    const handleOptions = {
      drawHandlesIfActive: (config && config.drawHandlesOnHover)
    };

    if (config.drawHandles) {
      drawHandles(context, eventData, data.handles, color, handleOptions);
    }

    // Draw the text
    if (data.text && data.text !== '') {
      context.font = font;

      // Calculate the text coordinates.
      const textWidth = context.measureText(data.text).width + 10;
      const textHeight = textStyle.getFontSize() + 10;

      let distance = Math.max(textWidth, textHeight) / 2 + 5;

      if (handleEndCanvas.x < handleStartCanvas.x) {
        distance = -distance;
      }

      let textCoords;

      if (!data.handles.textBox.hasMoved) {
        if (config.arrowFirst) {
          textCoords = {
            x: handleEndCanvas.x - textWidth / 2 + distance,
            y: handleEndCanvas.y - textHeight / 2
          };
        } else {
          // If the arrow is at the End position, the text should
          // Be placed near the Start position
          textCoords = {
            x: handleStartCanvas.x - textWidth / 2 - distance,
            y: handleStartCanvas.y - textHeight / 2
          };
        }

        const transform = cornerstone.internal.getTransform(enabledElement);

        transform.invert();

        const coords = transform.transformPoint(textCoords.x, textCoords.y);

        data.handles.textBox.x = coords.x;
        data.handles.textBox.y = coords.y;
      }

      textCoords = cornerstone.pixelToCanvas(eventData.element, data.handles.textBox);

      const boundingBox = drawTextBox(context, data.text, textCoords.x, textCoords.y, color);

      data.handles.textBox.boundingBox = boundingBox;

      if (data.handles.textBox.hasMoved) {
        // Draw dashed link line between tool and text
        const link = {
          start: {},
          end: {}
        };

        const midpointCanvas = {
          x: (handleStartCanvas.x + handleEndCanvas.x) / 2,
          y: (handleStartCanvas.y + handleEndCanvas.y) / 2
        };

        const points = [handleStartCanvas, handleEndCanvas, midpointCanvas];

        link.end.x = textCoords.x;
        link.end.y = textCoords.y;

        link.start = cornerstoneMath.point.findClosestPoint(points, link.end);

        const boundingBoxPoints = [{
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
  const measurementData = createNewMeasurement(touchEventData);
  const cornerstone = external.cornerstone;

  function doneChangingTextCallback (text) {
    if (text === null) {
      removeToolState(element, toolType, measurementData);
    } else {
      measurementData.text = text;
    }

    measurementData.active = false;
    cornerstone.updateImage(element);

    external.$(element).on('CornerstoneToolsTouchPress', arrowAnnotateTouch.pressCallback);
    external.$(element).on('CornerstoneToolsTouchStartActive', arrowAnnotateTouch.touchDownActivateCallback);
    external.$(element).on('CornerstoneToolsTap', arrowAnnotateTouch.tapCallback);
  }

  addToolState(element, toolType, measurementData);
  external.$(element).off('CornerstoneToolsTouchPress', arrowAnnotateTouch.pressCallback);
  external.$(element).off('CornerstoneToolsTouchStartActive', arrowAnnotateTouch.touchDownActivateCallback);
  external.$(element).off('CornerstoneToolsTap', arrowAnnotateTouch.tapCallback);
  cornerstone.updateImage(element);

  moveNewHandleTouch(touchEventData, toolType, measurementData, measurementData.handles.end, function () {
    cornerstone.updateImage(element);

    if (anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
      // Delete the measurement
      removeToolState(element, toolType, measurementData);
    }

    const config = arrowAnnotate.getConfiguration();

    if (measurementData.text === undefined) {
      config.getTextCallback(doneChangingTextCallback);
    }
  });
}

function doubleClickCallback (e, eventData) {
  const element = eventData.element;
  const cornerstone = external.cornerstone;
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

  const config = arrowAnnotate.getConfiguration();

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
}

function pressCallback (e, eventData) {
  const element = eventData.element;
  const cornerstone = external.cornerstone;
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

    external.$(element).on('CornerstoneToolsTouchStart', arrowAnnotateTouch.touchStartCallback);
    external.$(element).on('CornerstoneToolsTouchStartActive', arrowAnnotateTouch.touchDownActivateCallback);
    external.$(element).on('CornerstoneToolsTap', arrowAnnotateTouch.tapCallback);
  }

  if (e.data && e.data.mouseButtonMask && !isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
    return;
  }

  const config = arrowAnnotate.getConfiguration();

  const coords = eventData.currentPoints.canvas;
  const toolData = getToolState(element, toolType);

  // Now check to see if there is a handle we can move
  if (!toolData) {
    return;
  }

  if (eventData.handlePressed) {
    external.$(element).off('CornerstoneToolsTouchStart', arrowAnnotateTouch.touchStartCallback);
    external.$(element).off('CornerstoneToolsTouchStartActive', arrowAnnotateTouch.touchDownActivateCallback);
    external.$(element).off('CornerstoneToolsTap', arrowAnnotateTouch.tapCallback);

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

      external.$(element).off('CornerstoneToolsTouchStart', arrowAnnotateTouch.touchStartCallback);
      external.$(element).off('CornerstoneToolsTouchStartActive', arrowAnnotateTouch.touchDownActivateCallback);
      external.$(element).off('CornerstoneToolsTap', arrowAnnotateTouch.tapCallback);

      // Allow relabelling via a callback
      config.changeTextCallback(data, eventData, doneChangingTextCallback);

      e.stopImmediatePropagation();

      return false;
    }
  }

  return false; // False = causes jquery to preventDefault() and stopPropagation() this event
}

const arrowAnnotate = mouseButtonTool({
  addNewMeasurement,
  createNewMeasurement,
  onImageRendered,
  pointNearTool,
  toolType,
  mouseDoubleClickCallback: doubleClickCallback
});

arrowAnnotate.setConfiguration(configuration);

const arrowAnnotateTouch = touchTool({
  addNewMeasurement: addNewMeasurementTouch,
  createNewMeasurement,
  onImageRendered,
  pointNearTool,
  toolType,
  pressCallback
});

export { arrowAnnotate, arrowAnnotateTouch };
