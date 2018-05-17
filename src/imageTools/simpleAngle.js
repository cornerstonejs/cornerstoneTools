import EVENTS from '../events.js';
import external from '../externalModules.js';
import mouseButtonTool from './mouseButtonTool.js';
import drawLinkedTextBox from '../util/drawLinkedTextBox.js';
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

  const config = simpleAngle.getConfiguration();

  for (let i = 0; i < toolData.data.length; i++) {
    const data = toolData.data[i];

    if (data.visible === false) {
      continue;
    }

    // Differentiate the color of activation tool
    const color = toolColors.getColorIfActive(data);
    // Default to isotropic pixel size, update suffix to reflect this
    const columnPixelSpacing = eventData.image.columnPixelSpacing || 1;
    const rowPixelSpacing = eventData.image.rowPixelSpacing || 1;

    const handleOptions = {
      drawHandlesIfActive: (config && config.drawHandlesOnHover)
    };

    const text = textBoxText(data, rowPixelSpacing, columnPixelSpacing);

    draw(context, (context) => {
      setShadow(context, config);
      drawJoinedLines(context, eventData.element, data.handles.start, [data.handles.middle, data.handles.end], { color });
      drawHandles(context, eventData.element, data.handles, color, handleOptions);
      if (text) {
        drawLinkedTextBox(context, eventData.element, enabledElement, data.handles.textBox, text,
          data.handles, textBoxAnchorPoints, textBoxCoords, textBoxCoords, color, 0, true);
      }
    });
  }

  function textBoxCoords (context, element, enabledElement, handles, text) {
    const distance = 15;

    const handleStartCanvas = cornerstone.pixelToCanvas(element, handles.start);
    const handleMiddleCanvas = cornerstone.pixelToCanvas(element, handles.middle);

    const textCoords = {
      x: handleMiddleCanvas.x,
      y: handleMiddleCanvas.y
    };

    if (handleMiddleCanvas.x < handleStartCanvas.x) {
      textCoords.x -= distance + textBoxWidth(context, text);
    } else {
      textCoords.x += distance;
    }

    const transform = cornerstone.internal.getTransform(enabledElement);

    transform.invert();

    return transform.transformPoint(textCoords.x, textCoords.y);
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
