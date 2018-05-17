/* eslint no-alert:0 */
import EVENTS from '../events.js';
import external from '../externalModules.js';
import mouseButtonTool from './mouseButtonTool.js';
import touchTool from './touchTool.js';
import toolColors from '../stateManagement/toolColors.js';
import anyHandlesOutsideImage from '../manipulators/anyHandlesOutsideImage.js';
import moveHandle from '../manipulators/moveHandle.js';
import drawHandles from '../manipulators/drawHandles.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import pointInsideBoundingBox from '../util/pointInsideBoundingBox.js';
import drawLinkedTextBox from '../util/drawLinkedTextBox.js';
import { addToolState, removeToolState, getToolState } from '../stateManagement/toolState.js';
import { getToolOptions } from '../toolOptions.js';
import { drawCircle, getNewContext, draw, setShadow } from '../util/drawing.js';
import handleDistance from '../util/handleDistance.js';
import { textBoxWidth, textBoxHeight } from '../util/drawTextBox.js';

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
  const cornerstone = external.cornerstone;
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
    color: undefined,
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
  if (data.visible === false) {
    return false;
  }

  if (!data.handles.end) {
    return;
  }

  return handleDistance(data.handles.end, coords, element) < 25;
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
  const context = getNewContext(eventData.canvasContext.canvas);
  const config = seedAnnotate.getConfiguration();
  const handleRadius = 6;
  const handleOptions = { drawHandlesIfActive: (config && config.drawHandlesOnHover) };

  for (let i = 0; i < toolData.data.length; i++) {
    const data = toolData.data[i];

    if (data.visible === false) {
      continue;
    }
    const color = toolColors.getColorIfActive(data);
    const text = textBoxText(data);

    // Draw the circle always at the end of the handle
    draw(context, (context) => {
      setShadow(context, config);
      drawCircle(context, eventData.element, data.handles.end, handleRadius, { color });
      if (config.drawHandles) {
        drawHandles(context, eventData.element, cornerstone.pixelToCanvas(eventData.element, data.handles.end), color, handleOptions);
      }
      if (data.text && data.text !== '') {
        drawLinkedTextBox(context, eventData.element, enabledElement, data.handles.textBox, text,
          data.handles, textBoxAnchorPoints, textBoxCoords, color, 0, false);
      }
    });
  }

  function textBoxCoords (context, element, enabledElement, handles, text) {
    // Calculate the text coordinates.
    const handleCanvas = cornerstone.pixelToCanvas(element, handles.end);

    const textWidth = textBoxWidth(context, text);
    const textHeight = textBoxHeight(context, text);
    let distance = Math.max(textWidth, textHeight) / 2 + 5;

    if (handleCanvas.x > (context.canvas.width / 2)) {
      distance = -distance;
    }
    const textCoords = {
      x: handleCanvas.x - textWidth / 2 + distance,
      y: handleCanvas.y - textHeight / 2
    };

    const transform = cornerstone.internal.getTransform(enabledElement);

    transform.invert();

    return transform.transformPoint(textCoords.x, textCoords.y);
  }

  function textBoxText (data) {
    let textPlusCoords = '';

    if (config.showCoordinates) {
      textPlusCoords = `${data.text} x: ${Math.round(data.handles.end.x)
      } y: ${Math.round(data.handles.end.y)}`;
    } else {
      textPlusCoords = data.text;
    }

    return textPlusCoords;
  }

  function textBoxAnchorPoints (handles) {
    return [handles.end];
  }
}
// ---- Touch tool ----

// /////// BEGIN ACTIVE TOOL ///////
function addNewMeasurementTouch (touchEventData) {
  const cornerstone = external.cornerstone;
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

function doubleClickCallback (e) {
  const eventData = e.detail;
  const cornerstone = external.cornerstone;
  const element = eventData.element;
  let data;
  const options = getToolOptions(toolType, element);

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

  e.preventDefault();
  e.stopPropagation();
}

function pressCallback (e) {
  const eventData = e.detail;
  const cornerstone = external.cornerstone;
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

    element.addEventListener(EVENTS.TOUCH_START, seedAnnotateTouch.touchStartCallback);
    element.addEventListener(EVENTS.TOUCH_START_ACTIVE, seedAnnotateTouch.touchDownActivateCallback);
    element.addEventListener(EVENTS.TAP, seedAnnotateTouch.tapCallback);
  }

  const config = seedAnnotate.getConfiguration();

  const coords = eventData.currentPoints.canvas;
  const toolData = getToolState(element, toolType);

  // Now check to see if there is a handle we can move
  if (!toolData) {
    return false;
  }

  if (eventData.handlePressed) {
    element.removeEventListener(EVENTS.TOUCH_START, seedAnnotateTouch.touchStartCallback);
    element.removeEventListener(EVENTS.TOUCH_START_ACTIVE, seedAnnotateTouch.touchDownActivateCallback);
    element.removeEventListener(EVENTS.TAP, seedAnnotateTouch.tapCallback);

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

      element.removeEventListener(EVENTS.TOUCH_START, seedAnnotateTouch.touchStartCallback);
      element.removeEventListener(EVENTS.TOUCH_START_ACTIVE, seedAnnotateTouch.touchDownActivateCallback);
      element.removeEventListener(EVENTS.TAP, seedAnnotateTouch.tapCallback);

      // Allow relabelling via a callback
      config.changeTextCallback(data, eventData, doneChangingTextCallback);

      e.stopImmediatePropagation();

      return false;
    }
  }

  e.preventDefault();
  e.stopPropagation();
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
