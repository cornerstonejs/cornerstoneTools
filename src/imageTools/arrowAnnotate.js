/* eslint no-alert:0 */
import EVENTS from '../events.js';
import external from '../externalModules.js';
import mouseButtonTool from './mouseButtonTool.js';
import touchTool from './touchTool.js';
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
import drawLinkedTextBox from '../util/drawLinkedTextBox.js';
import { addToolState, removeToolState, getToolState } from '../stateManagement/toolState.js';
import { getToolOptions } from '../toolOptions.js';
import lineSegDistance from '../util/lineSegDistance.js';
import { getNewContext, draw, setShadow } from '../util/drawing.js';
import { textBoxWidth } from '../util/drawTextBox.js';
import triggerEvent from '../util/triggerEvent.js';

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
  const element = mouseEventData.element;
  const measurementData = createNewMeasurement(mouseEventData);
  const cornerstone = external.cornerstone;

  function doneChangingTextCallback (text) {
    if (text === null) {
      removeToolState(element, toolType, measurementData);
    } else {
      measurementData.text = text;
    }

    measurementData.active = false;
    cornerstone.updateImage(element);

    const eventType = EVENTS.MEASUREMENT_MODIFIED;
    const modifiedEventData = {
      toolType,
      element,
      measurementData
    };

    triggerEvent(element, eventType, modifiedEventData);

    element.addEventListener(EVENTS.MOUSE_MOVE, arrowAnnotate.mouseMoveCallback);
    element.addEventListener(EVENTS.MOUSE_DOWN, arrowAnnotate.mouseDownCallback);
    element.addEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, arrowAnnotate.mouseDownActivateCallback);
    element.addEventListener(EVENTS.MOUSE_DOUBLE_CLICK, arrowAnnotate.mouseDoubleClickCallback);
  }

  // Associate this data with this imageId so we can render it and manipulate it
  addToolState(element, toolType, measurementData);

  // Since we are dragging to another place to drop the end point, we can just activate
  // The end point and let the moveHandle move it for us.
  element.removeEventListener(EVENTS.MOUSE_MOVE, arrowAnnotate.mouseMoveCallback);
  element.removeEventListener(EVENTS.MOUSE_DOWN, arrowAnnotate.mouseDownCallback);
  element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, arrowAnnotate.mouseDownActivateCallback);
  element.removeEventListener(EVENTS.MOUSE_DOUBLE_CLICK, arrowAnnotate.mouseDoubleClickCallback);

  cornerstone.updateImage(element);
  moveNewHandle(mouseEventData, toolType, measurementData, measurementData.handles.end, function () {
    if (anyHandlesOutsideImage(mouseEventData, measurementData.handles)) {
      // Delete the measurement
      removeToolState(element, toolType, measurementData);
    }

    const config = arrowAnnotate.getConfiguration();

    if (measurementData.text === undefined) {
      config.getTextCallback(doneChangingTextCallback);
    }

    cornerstone.updateImage(element);
  });
}

function createNewMeasurement (eventData) {
  // Create the measurement data for this tool with the end handle activated
  const measurementData = {
    visible: true,
    active: true,
    color: undefined,
    handles: {
      start: {
        x: eventData.currentPoints.image.x,
        y: eventData.currentPoints.image.y,
        highlight: true,
        active: false
      },
      end: {
        x: eventData.currentPoints.image.x,
        y: eventData.currentPoints.image.y,
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
  if (data.visible === false) {
    return false;
  }

  return lineSegDistance(element, data.handles.start, data.handles.end, coords) < 25;
}

// /////// BEGIN IMAGE RENDERING ///////
function onImageRendered (e) {
  const eventData = e.detail;

  // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = getToolState(e.currentTarget, toolType);

  if (!toolData) {
    return;
  }

  const enabledElement = eventData.enabledElement;
  const cornerstone = external.cornerstone;

  // We have tool data for this element - iterate over each one and draw it
  const context = getNewContext(eventData.canvasContext.canvas);

  const lineWidth = toolStyle.getToolWidth();
  const config = arrowAnnotate.getConfiguration();

  for (let i = 0; i < toolData.data.length; i++) {
    const data = toolData.data[i];

    if (data.visible === false) {
      continue;
    }

    draw(context, (context) => {
      setShadow(context, config);

      const color = toolColors.getColorIfActive(data);

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

      const text = textBoxText(data);

      // Draw the text
      if (text && text !== '') {
        // Calculate the text coordinates.
        const padding = 5;
        const textWidth = textBoxWidth(context, text, padding);
        const textHeight = textStyle.getFontSize() + 10;

        let distance = Math.max(textWidth, textHeight) / 2 + 5;

        if (handleEndCanvas.x < handleStartCanvas.x) {
          distance = -distance;
        }

        if (!data.handles.textBox.hasMoved) {
          let textCoords;

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

        drawLinkedTextBox(context, eventData.element, data.handles.textBox, text,
          data.handles, textBoxAnchorPoints, color, lineWidth, 0, false);
      }
    });
  }

  function textBoxText (data) {
    return data.text;
  }

  function textBoxAnchorPoints (handles) {
    const midpoint = {
      x: (handles.start.x + handles.end.x) / 2,
      y: (handles.start.y + handles.end.y) / 2
    };

    return [handles.start, midpoint, handles.end];
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

    const eventType = EVENTS.MEASUREMENT_MODIFIED;
    const modifiedEventData = {
      toolType,
      element,
      measurementData
    };

    triggerEvent(element, eventType, modifiedEventData);

    element.addEventListener(EVENTS.TOUCH_PRESS, arrowAnnotateTouch.pressCallback);
    element.addEventListener(EVENTS.TOUCH_START_ACTIVE, arrowAnnotateTouch.touchDownActivateCallback);
    element.addEventListener(EVENTS.TAP, arrowAnnotateTouch.tapCallback);
  }

  addToolState(element, toolType, measurementData);
  element.removeEventListener(EVENTS.TOUCH_PRESS, arrowAnnotateTouch.pressCallback);
  element.removeEventListener(EVENTS.TOUCH_START_ACTIVE, arrowAnnotateTouch.touchDownActivateCallback);
  element.removeEventListener(EVENTS.TAP, arrowAnnotateTouch.tapCallback);
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

function doubleClickCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;
  const cornerstone = external.cornerstone;
  const options = getToolOptions(toolType, element);
  let data;

  if (!isMouseButtonEnabled(eventData.which, options.mouseButtonMask)) {
    return;
  }

  function doneChangingTextCallback (data, updatedText, deleteTool) {
    if (deleteTool === true) {
      removeToolState(element, toolType, data);
    } else {
      data.text = updatedText;
    }

    data.active = false;
    cornerstone.updateImage(element);
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

function pressCallback (e) {
  const eventData = e.detail;
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

    element.addEventListener(EVENTS.TOUCH_START, arrowAnnotateTouch.touchStartCallback);
    element.addEventListener(EVENTS.TOUCH_START_ACTIVE, arrowAnnotateTouch.touchDownActivateCallback);
    element.addEventListener(EVENTS.TAP, arrowAnnotateTouch.tapCallback);
  }

  const config = arrowAnnotate.getConfiguration();

  const coords = eventData.currentPoints.canvas;
  const toolData = getToolState(element, toolType);

  // Now check to see if there is a handle we can move
  if (!toolData) {
    return;
  }

  if (eventData.handlePressed) {
    element.removeEventListener(EVENTS.TOUCH_START, arrowAnnotateTouch.touchStartCallback);
    element.removeEventListener(EVENTS.TOUCH_START_ACTIVE, arrowAnnotateTouch.touchDownActivateCallback);
    element.removeEventListener(EVENTS.TAP, arrowAnnotateTouch.tapCallback);

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

      element.removeEventListener(EVENTS.TOUCH_START, arrowAnnotateTouch.touchStartCallback);
      element.removeEventListener(EVENTS.TOUCH_START_ACTIVE, arrowAnnotateTouch.touchDownActivateCallback);
      element.removeEventListener(EVENTS.TAP, arrowAnnotateTouch.tapCallback);

      // Allow relabelling via a callback
      config.changeTextCallback(data, eventData, doneChangingTextCallback);

      e.stopImmediatePropagation();

      return false;
    }
  }

  e.preventDefault();
  e.stopPropagation();
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