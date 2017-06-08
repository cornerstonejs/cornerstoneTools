import * as cornerstone from 'cornerstone-core';
import * as cornerstoneMath from 'cornerstone-math';
import mouseButtonTool from './mouseButtonTool.js';
import drawTextBox from '../util/drawTextBox.js';
import roundToDecimal from '../util/roundToDecimal.js';
import textStyle from '../stateManagement/textStyle.js';
import toolStyle from '../stateManagement/toolStyle.js';
import toolColors from '../stateManagement/toolColors.js';
import anyHandlesOutsideImage from '../manipulators/anyHandlesOutsideImage.js';
import moveNewHandle from '../manipulators/moveNewHandle';
import moveNewHandleTouch from '../manipulators/moveNewHandleTouch';
import drawHandles from '../manipulators/drawHandles';
import touchTool from './touchTool';
import { addToolState, removeToolState, getToolState } from '../stateManagement/toolState.js';


const toolType = 'simpleAngle';

// /////// BEGIN ACTIVE TOOL ///////
function createNewMeasurement (mouseEventData) {
    // Create the measurement data for this tool with the end handle activated
  const angleData = {
    visible: true,
    active: true,
    handles: {
      start: {
        x: mouseEventData.currentPoints.image.x,
        y: mouseEventData.currentPoints.image.y,
        highlight: true,
        active: false
      },
      middle: {
        x: mouseEventData.currentPoints.image.x,
        y: mouseEventData.currentPoints.image.y,
        highlight: true,
        active: true
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

  return angleData;
}
// /////// END ACTIVE TOOL ///////

function pointNearTool (element, data, coords) {
  const lineSegment = {
    start: cornerstone.pixelToCanvas(element, data.handles.start),
    end: cornerstone.pixelToCanvas(element, data.handles.middle)
  };

  let distanceToPoint = cornerstoneMath.lineSegment.distanceToPoint(lineSegment, coords);

  if (distanceToPoint < 25) {
    return true;
  }

  lineSegment.start = cornerstone.pixelToCanvas(element, data.handles.middle);
  lineSegment.end = cornerstone.pixelToCanvas(element, data.handles.end);

  distanceToPoint = cornerstoneMath.lineSegment.distanceToPoint(lineSegment, coords);

  return (distanceToPoint < 25);
}

function length (vector) {
  return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
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

    // Activation color
  let color;
  const lineWidth = toolStyle.getToolWidth();
  const font = textStyle.getFont();
  const config = simpleAngle.getConfiguration();

  for (let i = 0; i < toolData.data.length; i++) {
    context.save();

    if (config && config.shadow) {
      context.shadowColor = config.shadowColor || '#000000';
      context.shadowOffsetX = config.shadowOffsetX || 1;
      context.shadowOffsetY = config.shadowOffsetY || 1;
    }

    const data = toolData.data[i];

        // Differentiate the color of activation tool
    if (data.active) {
      color = toolColors.getActiveColor();
    } else {
      color = toolColors.getToolColor();
    }

    const handleStartCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.start);
    const handleMiddleCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.middle);
    const handleEndCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.end);

        // Draw the line
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.moveTo(handleStartCanvas.x, handleStartCanvas.y);
    context.lineTo(handleMiddleCanvas.x, handleMiddleCanvas.y);
    context.lineTo(handleEndCanvas.x, handleEndCanvas.y);
    context.stroke();

        // Draw the handles
    const handleOptions = {
      drawHandlesIfActive: (config && config.drawHandlesOnHover)
    };

    drawHandles(context, eventData, data.handles, color, handleOptions);

        // Draw the text
    context.fillStyle = color;

        // Default to isotropic pixel size, update suffix to reflect this
    const columnPixelSpacing = eventData.image.columnPixelSpacing || 1;
    const rowPixelSpacing = eventData.image.rowPixelSpacing || 1;
    let suffix = '';

    if (!eventData.image.rowPixelSpacing || !eventData.image.columnPixelSpacing) {
      suffix = ' (isotropic)';
    }

    const sideA = {
      x: (Math.ceil(data.handles.middle.x) - Math.ceil(data.handles.start.x)) * columnPixelSpacing,
      y: (Math.ceil(data.handles.middle.y) - Math.ceil(data.handles.start.y)) * rowPixelSpacing
    };

    const sideB = {
      x: (Math.ceil(data.handles.end.x) - Math.ceil(data.handles.middle.x)) * columnPixelSpacing,
      y: (Math.ceil(data.handles.end.y) - Math.ceil(data.handles.middle.y)) * rowPixelSpacing
    };

    const sideC = {
      x: (Math.ceil(data.handles.end.x) - Math.ceil(data.handles.start.x)) * columnPixelSpacing,
      y: (Math.ceil(data.handles.end.y) - Math.ceil(data.handles.start.y)) * rowPixelSpacing
    };

    const sideALength = length(sideA);
    const sideBLength = length(sideB);
    const sideCLength = length(sideC);

        // Cosine law
    let angle = Math.acos((Math.pow(sideALength, 2) + Math.pow(sideBLength, 2) - Math.pow(sideCLength, 2)) / (2 * sideALength * sideBLength));

    angle *= (180 / Math.PI);

    const rAngle = roundToDecimal(angle, 2);

    if (rAngle) {
      const str = '00B0'; // Degrees symbol
      const text = rAngle.toString() + String.fromCharCode(parseInt(str, 16)) + suffix;

      const distance = 15;

      let textCoords;

      if (data.handles.textBox.hasMoved) {
        textCoords = cornerstone.pixelToCanvas(eventData.element, data.handles.textBox);
      } else {
        textCoords = {
          x: handleMiddleCanvas.x,
          y: handleMiddleCanvas.y
        };

        context.font = font;
        const textWidth = context.measureText(text).width;

        if (handleMiddleCanvas.x < handleStartCanvas.x) {
          textCoords.x -= distance + textWidth + 10;
        } else {
          textCoords.x += distance;
        }

        const transform = cornerstone.internal.getTransform(enabledElement);

        transform.invert();

        const coords = transform.transformPoint(textCoords.x, textCoords.y);

        data.handles.textBox.x = coords.x;
        data.handles.textBox.y = coords.y;
      }

      const options = {
        centering: {
          x: false,
          y: true
        }
      };

      const boundingBox = drawTextBox(context, text, textCoords.x, textCoords.y, color, options);

      data.handles.textBox.boundingBox = boundingBox;

      if (data.handles.textBox.hasMoved) {
                // Draw dashed link line between tool and text
        const link = {
          start: {},
          end: {}
        };

        const points = [handleStartCanvas, handleEndCanvas, handleMiddleCanvas];

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
// /////// END IMAGE RENDERING ///////

// /////// BEGIN ACTIVE TOOL ///////
function addNewMeasurement (mouseEventData) {
  const measurementData = createNewMeasurement(mouseEventData);
  const element = mouseEventData.element;

  const eventData = {
    mouseButtonMask: mouseEventData.which
  };

    // Associate this data with this imageId so we can render it and manipulate it
  addToolState(element, toolType, measurementData);

    // Since we are dragging to another place to drop the end point, we can just activate
    // The end point and let the moveHandle move it for us.
  $(element).off('CornerstoneToolsMouseMove', simpleAngle.mouseMoveCallback);
  $(element).off('CornerstoneToolsMouseDrag', simpleAngle.mouseMoveCallback);
  $(element).off('CornerstoneToolsMouseDown', simpleAngle.mouseDownCallback);
  $(element).off('CornerstoneToolsMouseDownActivate', simpleAngle.mouseDownActivateCallback);
  cornerstone.updateImage(element);

  moveNewHandle(mouseEventData, toolType, measurementData, measurementData.handles.middle, function () {
    measurementData.active = false;
    if (anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
            // Delete the measurement
      removeToolState(element, toolType, measurementData);

      $(element).on('CornerstoneToolsMouseMove', simpleAngle.mouseMoveCallback);
      $(element).on('CornerstoneToolsMouseDrag', simpleAngle.mouseMoveCallback);
      $(element).on('CornerstoneToolsMouseDown', eventData, simpleAngle.mouseDownCallback);
      $(element).on('CornerstoneToolsMouseDownActivate', eventData, simpleAngle.mouseDownActivateCallback);
      cornerstone.updateImage(element);

      return;
    }

    measurementData.handles.end.active = true;
    cornerstone.updateImage(element);

    moveNewHandle(mouseEventData, toolType, measurementData, measurementData.handles.end, function () {
      measurementData.active = false;
      if (anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
                // Delete the measurement
        removeToolState(element, toolType, measurementData);
      }

      $(element).on('CornerstoneToolsMouseMove', simpleAngle.mouseMoveCallback);
      $(element).on('CornerstoneToolsMouseDrag', simpleAngle.mouseMoveCallback);
      $(element).on('CornerstoneToolsMouseDown', eventData, simpleAngle.mouseDownCallback);
      $(element).on('CornerstoneToolsMouseDownActivate', eventData, simpleAngle.mouseDownActivateCallback);
      cornerstone.updateImage(element);
    });
  });
}

function addNewMeasurementTouch (touchEventData) {
  const measurementData = createNewMeasurement(touchEventData);
  const element = touchEventData.element;

    // Associate this data with this imageId so we can render it and manipulate it
  addToolState(element, toolType, measurementData);

    // Since we are dragging to another place to drop the end point, we can just activate
    // The end point and let the moveHandle move it for us.
  $(element).off('CornerstoneToolsTouchDrag', simpleAngleTouch.touchMoveCallback);
  $(element).off('CornerstoneToolsTouchStartActive', simpleAngleTouch.touchDownActivateCallback);
  $(element).off('CornerstoneToolsTouchStart', simpleAngleTouch.touchStartCallback);
  $(element).off('CornerstoneToolsTap', simpleAngleTouch.tapCallback);
  cornerstone.updateImage(element);

  moveNewHandleTouch(touchEventData, toolType, measurementData, measurementData.handles.middle, function () {
    if (anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
            // Delete the measurement
      removeToolState(element, toolType, measurementData);
      $(element).on('CornerstoneToolsTouchDrag', simpleAngleTouch.touchMoveCallback);
      $(element).on('CornerstoneToolsTouchStart', simpleAngleTouch.touchStartCallback);
      $(element).on('CornerstoneToolsTouchStartActive', simpleAngleTouch.touchDownActivateCallback);
      $(element).on('CornerstoneToolsTap', simpleAngleTouch.tapCallback);
      cornerstone.updateImage(element);

      return;
    }

    moveNewHandleTouch(touchEventData, toolType, measurementData, measurementData.handles.end, function () {
      if (anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
                // Delete the measurement
        removeToolState(element, toolType, measurementData);
        cornerstone.updateImage(element);
      }

      $(element).on('CornerstoneToolsTouchDrag', simpleAngleTouch.touchMoveCallback);
      $(element).on('CornerstoneToolsTouchStart', simpleAngleTouch.touchStartCallback);
      $(element).on('CornerstoneToolsTouchStartActive', simpleAngleTouch.touchDownActivateCallback);
      $(element).on('CornerstoneToolsTap', simpleAngleTouch.tapCallback);
    });
  });
}

const simpleAngle = mouseButtonTool({
  createNewMeasurement,
  addNewMeasurement,
  onImageRendered,
  pointNearTool,
  toolType
});

const simpleAngleTouch = touchTool({
  createNewMeasurement,
  addNewMeasurement: addNewMeasurementTouch,
  onImageRendered,
  pointNearTool,
  toolType
});

export {
  simpleAngle,
  simpleAngleTouch
};
