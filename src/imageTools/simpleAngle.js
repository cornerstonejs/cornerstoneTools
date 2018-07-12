import EVENTS from '../events.js';
import external from '../externalModules.js';
import mouseButtonTool from './mouseButtonTool.js';
import roundToDecimal from '../util/roundToDecimal.js';
import drawLinkedTextBox from '../util/drawLinkedTextBox.js';
import toolStyle from '../stateManagement/toolStyle.js';
import toolColors from '../stateManagement/toolColors.js';
import anyHandlesOutsideImage from '../manipulators/anyHandlesOutsideImage.js';
import moveNewHandle from '../manipulators/moveNewHandle.js';
import moveNewHandleTouch from '../manipulators/moveNewHandleTouch.js';
import drawHandles from '../manipulators/drawHandles.js';
import touchTool from './touchTool.js';
import lineSegDistance from '../util/lineSegDistance.js';
import { addToolState, removeToolState, getToolState } from '../stateManagement/toolState.js';
import { getNewContext, draw, setShadow, drawJoinedLines } from '../util/drawing.js';
import { textBoxWidth } from '../util/drawTextBox.js';


const toolType = 'simpleAngle';

// /////// BEGIN ACTIVE TOOL ///////
function createNewMeasurement (mouseEventData) {
  // Create the measurement data for this tool with the end handle activated
  const angleData = {
    visible: true,
    active: true,
    color: undefined,
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
  if (data.visible === false) {
    return false;
  }

  return lineSegDistance(element, data.handles.start, data.handles.middle, coords) < 25 ||
    lineSegDistance(element, data.handles.middle, data.handles.end, coords) < 25;
}

function length (vector) {
  return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
}

// /////// BEGIN IMAGE RENDERING ///////
function onImageRendered (e) {
  const eventData = e.detail;
  // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = getToolState(e.currentTarget, toolType);

  if (!toolData) {
    return;
  }

  const cornerstone = external.cornerstone;
  const enabledElement = eventData.enabledElement;

  // We have tool data for this element - iterate over each one and draw it
  const context = getNewContext(eventData.canvasContext.canvas);

  const lineWidth = toolStyle.getToolWidth();
  const config = simpleAngle.getConfiguration();

  for (let i = 0; i < toolData.data.length; i++) {
    const data = toolData.data[i];

    if (data.visible === false) {
      continue;
    }

    draw(context, (context) => {
      setShadow(context, config);

      // Differentiate the color of activation tool
      const color = toolColors.getColorIfActive(data);

      const handleStartCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.start);
      const handleMiddleCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.middle);

      drawJoinedLines(context, eventData.element, data.handles.start, [data.handles.middle, data.handles.end], { color });

      // Draw the handles
      const handleOptions = {
        drawHandlesIfActive: (config && config.drawHandlesOnHover)
      };

      drawHandles(context, eventData, data.handles, color, handleOptions);

      // Default to isotropic pixel size, update suffix to reflect this
      const columnPixelSpacing = eventData.image.columnPixelSpacing || 1;
      const rowPixelSpacing = eventData.image.rowPixelSpacing || 1;

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

      data.rAngle = roundToDecimal(angle, 2);

      if (data.rAngle) {
        const text = textBoxText(data, eventData.image.rowPixelSpacing, eventData.image.columnPixelSpacing);

        const distance = 15;

        let textCoords;

        if (!data.handles.textBox.hasMoved) {
          textCoords = {
            x: handleMiddleCanvas.x,
            y: handleMiddleCanvas.y
          };

          const padding = 5;
          const textWidth = textBoxWidth(context, text, padding);

          if (handleMiddleCanvas.x < handleStartCanvas.x) {
            textCoords.x -= distance + textWidth;
          } else {
            textCoords.x += distance;
          }

          const transform = cornerstone.internal.getTransform(enabledElement);

          transform.invert();

          const coords = transform.transformPoint(textCoords.x, textCoords.y);

          data.handles.textBox.x = coords.x;
          data.handles.textBox.y = coords.y;
        }

        drawLinkedTextBox(context, eventData.element, data.handles.textBox, text,
          data.handles, textBoxAnchorPoints, color, lineWidth, 0, true);
      }
    });
  }

  function textBoxText (data, rowPixelSpacing, columnPixelSpacing) {
    const suffix = (!rowPixelSpacing || !columnPixelSpacing) ? ' (isotropic)' : '';
    const str = '00B0'; // Degrees symbol

    return data.rAngle.toString() + String.fromCharCode(parseInt(str, 16)) + suffix;
  }

  function textBoxAnchorPoints (handles) {
    return [handles.start, handles.middle, handles.end];
  }
}
// /////// END IMAGE RENDERING ///////

// /////// BEGIN ACTIVE TOOL ///////
function addNewMeasurement (mouseEventData) {
  const cornerstone = external.cornerstone;
  const measurementData = createNewMeasurement(mouseEventData);
  const element = mouseEventData.element;

  // Associate this data with this imageId so we can render it and manipulate it
  addToolState(element, toolType, measurementData);

  // Since we are dragging to another place to drop the end point, we can just activate
  // The end point and let the moveHandle move it for us.
  element.removeEventListener(EVENTS.MOUSE_MOVE, simpleAngle.mouseMoveCallback);
  element.removeEventListener(EVENTS.MOUSE_DRAG, simpleAngle.mouseMoveCallback);
  element.removeEventListener(EVENTS.MOUSE_DOWN, simpleAngle.mouseDownCallback);
  element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, simpleAngle.mouseDownActivateCallback);
  cornerstone.updateImage(element);

  moveNewHandle(mouseEventData, toolType, measurementData, measurementData.handles.middle, function () {
    measurementData.active = false;
    if (anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
      // Delete the measurement
      removeToolState(element, toolType, measurementData);

      element.addEventListener(EVENTS.MOUSE_MOVE, simpleAngle.mouseMoveCallback);
      element.addEventListener(EVENTS.MOUSE_DRAG, simpleAngle.mouseMoveCallback);
      element.addEventListener(EVENTS.MOUSE_DOWN, simpleAngle.mouseDownCallback);
      element.addEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, simpleAngle.mouseDownActivateCallback);
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

      element.addEventListener(EVENTS.MOUSE_MOVE, simpleAngle.mouseMoveCallback);
      element.addEventListener(EVENTS.MOUSE_DRAG, simpleAngle.mouseMoveCallback);
      element.addEventListener(EVENTS.MOUSE_DOWN, simpleAngle.mouseDownCallback);
      element.addEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, simpleAngle.mouseDownActivateCallback);
      cornerstone.updateImage(element);
    });
  });
}

function addNewMeasurementTouch (touchEventData) {
  const cornerstone = external.cornerstone;
  const measurementData = createNewMeasurement(touchEventData);
  const element = touchEventData.element;

  // Associate this data with this imageId so we can render it and manipulate it
  addToolState(element, toolType, measurementData);

  // Since we are dragging to another place to drop the end point, we can just activate
  // The end point and let the moveHandle move it for us.
  element.removeEventListener(EVENTS.TOUCH_DRAG, simpleAngleTouch.touchMoveCallback);
  element.removeEventListener(EVENTS.TOUCH_START_ACTIVE, simpleAngleTouch.touchDownActivateCallback);
  element.removeEventListener(EVENTS.TOUCH_START, simpleAngleTouch.touchStartCallback);
  element.removeEventListener(EVENTS.TAP, simpleAngleTouch.tapCallback);
  cornerstone.updateImage(element);

  moveNewHandleTouch(touchEventData, toolType, measurementData, measurementData.handles.middle, function () {
    if (anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
      // Delete the measurement
      removeToolState(element, toolType, measurementData);
      element.addEventListener(EVENTS.TOUCH_DRAG, simpleAngleTouch.touchMoveCallback);
      element.addEventListener(EVENTS.TOUCH_START, simpleAngleTouch.touchStartCallback);
      element.addEventListener(EVENTS.TOUCH_START_ACTIVE, simpleAngleTouch.touchDownActivateCallback);
      element.addEventListener(EVENTS.TAP, simpleAngleTouch.tapCallback);
      cornerstone.updateImage(element);

      return;
    }

    moveNewHandleTouch(touchEventData, toolType, measurementData, measurementData.handles.end, function () {
      if (anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
        // Delete the measurement
        removeToolState(element, toolType, measurementData);
        cornerstone.updateImage(element);
      }

      element.addEventListener(EVENTS.TOUCH_DRAG, simpleAngleTouch.touchMoveCallback);
      element.addEventListener(EVENTS.TOUCH_START, simpleAngleTouch.touchStartCallback);
      element.addEventListener(EVENTS.TOUCH_START_ACTIVE, simpleAngleTouch.touchDownActivateCallback);
      element.addEventListener(EVENTS.TAP, simpleAngleTouch.tapCallback);
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
