import EVENTS from '../events.js';
import external from '../externalModules.js';
import mouseButtonTool from './mouseButtonTool.js';
import touchTool from './touchTool.js';
import pointInsideBoundingBox from '../util/pointInsideBoundingBox.js';
import toolColors from '../stateManagement/toolColors.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import drawTextBox from '../util/drawTextBox.js';
import { removeToolState, getToolState } from '../stateManagement/toolState.js';
import { getToolOptions } from '../toolOptions.js';

const toolType = 'textMarker';

// /////// BEGIN ACTIVE TOOL ///////
function createNewMeasurement (mouseEventData) {
  const config = textMarker.getConfiguration();

  if (!config.current) {
    return;
  }

  // Create the measurement data for this tool with the end handle activated
  const measurementData = {
    visible: true,
    active: true,
    text: config.current,
    handles: {
      end: {
        x: mouseEventData.currentPoints.image.x,
        y: mouseEventData.currentPoints.image.y,
        highlight: true,
        active: true,
        hasBoundingBox: true
      }
    }
  };

    // Create a rectangle representing the image
  const imageRect = {
    left: 0,
    top: 0,
    width: mouseEventData.image.width,
    height: mouseEventData.image.height
  };

    // Check if the current handle is outside the image,
    // If it is, prevent the handle creation
  if (!external.cornerstoneMath.point.insideRect(measurementData.handles.end, imageRect)) {
    return;
  }

  // Update the current marker for the next marker
  let currentIndex = config.markers.indexOf(config.current);

  if (config.ascending) {
    currentIndex += 1;
    if (currentIndex >= config.markers.length) {
      if (config.loop) {
        currentIndex -= config.markers.length;
      } else {
        currentIndex = -1;
      }
    }
  } else {
    currentIndex -= 1;
    if (currentIndex < 0) {
      if (config.loop) {
        currentIndex += config.markers.length;
      } else {
        currentIndex = -1;
      }
    }
  }

  config.current = config.markers[currentIndex];

  return measurementData;
}
// /////// END ACTIVE TOOL ///////

// /////// BEGIN IMAGE RENDERING ///////
function pointNearTool (element, data, coords) {
  if (!data.handles.end.boundingBox) {
    return;
  }

  const distanceToPoint = external.cornerstoneMath.rect.distanceToPoint(data.handles.end.boundingBox, coords);
  const insideBoundingBox = pointInsideBoundingBox(data.handles.end, coords);


  return (distanceToPoint < 10) || insideBoundingBox;
}

function onImageRendered (e) {
  const eventData = e.detail;

  // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = getToolState(eventData.element, toolType);

  if (!toolData) {
    return;
  }

  // We have tool data for this element - iterate over each one and draw it
  const context = eventData.canvasContext.canvas.getContext('2d');

  context.setTransform(1, 0, 0, 1, 0, 0);

  const config = textMarker.getConfiguration();

  for (let i = 0; i < toolData.data.length; i++) {
    const data = toolData.data[i];

    let color = toolColors.getToolColor();

    if (data.active) {
      color = toolColors.getActiveColor();
    }

    context.save();

    if (config && config.shadow) {
      context.shadowColor = config.shadowColor || '#000000';
      context.shadowOffsetX = config.shadowOffsetX || 1;
      context.shadowOffsetY = config.shadowOffsetY || 1;
    }

    // Draw text
    context.fillStyle = color;
    const measureText = context.measureText(data.text);

    data.textWidth = measureText.width + 10;

    const textCoords = external.cornerstone.pixelToCanvas(eventData.element, data.handles.end);

    const options = {
      centering: {
        x: true,
        y: true
      }
    };

    data.handles.end.boundingBox = drawTextBox(context, data.text, textCoords.x, textCoords.y - 10, color, options);

    context.restore();
  }
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

    element.addEventListener(EVENTS.MOUSE_MOVE, textMarker.mouseMoveCallback);
    element.addEventListener(EVENTS.MOUSE_DOWN, textMarker.mouseDownCallback);
    element.addEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, textMarker.mouseDownActivateCallback);
    element.addEventListener(EVENTS.MOUSE_DOUBLE_CLICK, textMarker.mouseDoubleClickCallback);
  }

  const config = textMarker.getConfiguration();
  const coords = eventData.currentPoints.canvas;
  const toolData = getToolState(element, toolType);

  // Now check to see if there is a handle we can move
  if (!toolData) {
    return;
  }

  for (let i = 0; i < toolData.data.length; i++) {
    data = toolData.data[i];
    if (pointNearTool(element, data, coords)) {
      data.active = true;
      cornerstone.updateImage(element);

      element.removeEventListener(EVENTS.MOUSE_MOVE, textMarker.mouseMoveCallback);
      element.removeEventListener(EVENTS.MOUSE_DOWN, textMarker.mouseDownCallback);
      element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, textMarker.mouseDownActivateCallback);
      element.removeEventListener(EVENTS.MOUSE_DOUBLE_CLICK, textMarker.mouseDoubleClickCallback);
      // Allow relabelling via a callback
      config.changeTextCallback(data, eventData, doneChangingTextCallback);

      e.stopImmediatePropagation();
      e.preventDefault();
      e.stopPropagation();

      return;
    }
  }

  e.preventDefault();
  e.stopPropagation();
}

function touchPressCallback (e) {
  const eventData = e.detail;
  const cornerstone = external.cornerstone;
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

    element.addEventListener(EVENTS.TOUCH_DRAG, textMarkerTouch.touchMoveCallback);
    element.addEventListener(EVENTS.TOUCH_START_ACTIVE, textMarkerTouch.touchDownActivateCallback);
    element.addEventListener(EVENTS.TOUCH_START, textMarkerTouch.touchStartCallback);
    element.addEventListener(EVENTS.TAP, textMarkerTouch.tapCallback);
    element.addEventListener(EVENTS.TOUCH_PRESS, textMarkerTouch.pressCallback);
  }

  const config = textMarker.getConfiguration();

  const coords = eventData.currentPoints.canvas;
  const toolData = getToolState(element, toolType);

  // Now check to see if there is a handle we can move
  if (!toolData) {
    return false;
  }

  if (eventData.handlePressed) {
    eventData.handlePressed.active = true;
    cornerstone.updateImage(element);

    element.removeEventListener(EVENTS.TOUCH_DRAG, textMarkerTouch.touchMoveCallback);
    element.removeEventListener(EVENTS.TOUCH_START_ACTIVE, textMarkerTouch.touchDownActivateCallback);
    element.removeEventListener(EVENTS.TOUCH_START, textMarkerTouch.touchStartCallback);
    element.removeEventListener(EVENTS.TAP, textMarkerTouch.tapCallback);
    element.removeEventListener(EVENTS.TOUCH_PRESS, textMarkerTouch.pressCallback);

    // Allow relabelling via a callback
    config.changeTextCallback(eventData.handlePressed, eventData, doneChangingTextCallback);

    e.stopImmediatePropagation();
    e.preventDefault();
    e.stopPropagation();

    return;
  }

  for (let i = 0; i < toolData.data.length; i++) {
    data = toolData.data[i];
    if (pointNearTool(element, data, coords)) {
      data.active = true;
      cornerstone.updateImage(element);

      element.removeEventListener(EVENTS.TOUCH_DRAG, textMarkerTouch.touchMoveCallback);
      element.removeEventListener(EVENTS.TOUCH_START_ACTIVE, textMarkerTouch.touchDownActivateCallback);
      element.removeEventListener(EVENTS.TOUCH_START, textMarkerTouch.touchStartCallback);
      element.removeEventListener(EVENTS.TAP, textMarkerTouch.tapCallback);
      element.removeEventListener(EVENTS.TOUCH_PRESS, textMarkerTouch.pressCallback);
      // Allow relabelling via a callback
      config.changeTextCallback(data, eventData, doneChangingTextCallback);

      e.stopImmediatePropagation();
      e.preventDefault();
      e.stopPropagation();

      return;
    }
  }

  e.preventDefault();
  e.stopPropagation();
}

const textMarker = mouseButtonTool({
  createNewMeasurement,
  onImageRendered,
  pointNearTool,
  toolType,
  mouseDoubleClickCallback: doubleClickCallback
});

const textMarkerTouch = touchTool({
  createNewMeasurement,
  onImageRendered,
  pointNearTool,
  toolType,
  pressCallback: touchPressCallback
});

export {
  textMarker,
  textMarkerTouch
};
