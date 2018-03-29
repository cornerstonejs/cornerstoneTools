import EVENTS from '../events.js';
import external from '../externalModules.js';
import touchDragTool from './touchDragTool.js';
import { getBrowserInfo } from '../util/getMaxSimultaneousRequests.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { setToolOptions, getToolOptions } from '../toolOptions.js';

const toolType = 'magnify';

let configuration = {
  magnifySize: 100,
  magnificationLevel: 2
};

let browserName;

let currentPoints;

/** Remove the magnifying glass when the mouse event ends */
function mouseUpCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  element.removeEventListener(EVENTS.MOUSE_DRAG, dragCallback);
  element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
  element.removeEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
  element.removeEventListener(EVENTS.IMAGE_RENDERED, imageRenderedCallback);
  hideTool(eventData);
}

function hideTool (eventData) {
  const element = eventData.element;

  element.querySelector('.magnifyTool').style.display = 'none';

  // Re-enable the mouse cursor
  document.body.style.cursor = 'default';
}

/** Draw the magnifying glass on mouseDown, and begin tracking mouse movements */
function mouseDownCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;
  const options = getToolOptions(toolType, element);

  if (isMouseButtonEnabled(eventData.which, options.mouseButtonMask)) {
    element.addEventListener(EVENTS.MOUSE_DRAG, dragCallback);
    element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);

    currentPoints = eventData.currentPoints;
    element.addEventListener(EVENTS.IMAGE_RENDERED, imageRenderedCallback);
    drawMagnificationTool(eventData);

    e.preventDefault();
    e.stopPropagation();
  }
}

function imageRenderedCallback (e) {
  const eventData = e.detail;

  eventData.currentPoints = currentPoints;
  drawMagnificationTool(eventData);
}

function dragEndCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  element.removeEventListener(EVENTS.TOUCH_DRAG_END, dragEndCallback);
  element.removeEventListener(EVENTS.TOUCH_END, dragEndCallback);
  element.removeEventListener(EVENTS.IMAGE_RENDERED, imageRenderedCallback);
  hideTool(eventData);
}

/** Drag callback is triggered by both the touch and mouse magnify tools */
function dragCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  currentPoints = eventData.currentPoints;

  drawMagnificationTool(eventData);
  if (eventData.isTouchEvent === true) {
    element.addEventListener(EVENTS.TOUCH_DRAG_END, dragEndCallback);
    element.addEventListener(EVENTS.TOUCH_END, dragEndCallback);
  }

  e.preventDefault();
  e.stopPropagation();
}

/** Draws the magnifying glass */
function drawMagnificationTool (eventData) {
  const element = eventData.element;
  const magnifyCanvas = element.querySelector('.magnifyTool');

  if (!magnifyCanvas) {
    createMagnificationCanvas(eventData.element);
  }

  const config = magnify.getConfiguration();

  const magnifySize = config.magnifySize;
  const magnificationLevel = config.magnificationLevel;

  // The 'not' magnifyTool class here is necessary because cornerstone places
  // No classes of it's own on the canvas we want to select
  const canvas = element.querySelector('canvas:not(.magnifyTool)');
  const context = canvas.getContext('2d');

  context.setTransform(1, 0, 0, 1, 0, 0);

  const zoomCtx = magnifyCanvas.getContext('2d');

  zoomCtx.setTransform(1, 0, 0, 1, 0, 0);

  const getSize = magnifySize / magnificationLevel;

  // Calculate the on-canvas location of the mouse pointer / touch
  const canvasLocation = external.cornerstone.pixelToCanvas(eventData.element, eventData.currentPoints.image);

  if (eventData.isTouchEvent === true) {
    canvasLocation.y -= 1.25 * getSize;
  }

  canvasLocation.x = Math.max(canvasLocation.x, 0);
  canvasLocation.x = Math.min(canvasLocation.x, canvas.width);

  canvasLocation.y = Math.max(canvasLocation.y, 0);
  canvasLocation.y = Math.min(canvasLocation.y, canvas.height);

  // Clear the rectangle
  zoomCtx.clearRect(0, 0, magnifySize, magnifySize);
  zoomCtx.fillStyle = 'transparent';

  // Fill it with the pixels that the mouse is clicking on
  zoomCtx.fillRect(0, 0, magnifySize, magnifySize);

  const copyFrom = {
    x: canvasLocation.x - 0.5 * getSize,
    y: canvasLocation.y - 0.5 * getSize
  };

  if (browserName === 'Safari') {
    // Safari breaks when trying to copy pixels with negative indices
    // This prevents proper Magnify usage
    copyFrom.x = Math.max(copyFrom.x, 0);
    copyFrom.y = Math.max(copyFrom.y, 0);
  }

  copyFrom.x = Math.min(copyFrom.x, canvas.width);
  copyFrom.y = Math.min(copyFrom.y, canvas.height);

  const scaledMagnify = {
    x: (canvas.width - copyFrom.x) * magnificationLevel,
    y: (canvas.height - copyFrom.y) * magnificationLevel
  };

  zoomCtx.drawImage(canvas, copyFrom.x, copyFrom.y, canvas.width - copyFrom.x, canvas.height - copyFrom.y, 0, 0, scaledMagnify.x, scaledMagnify.y);

  // Place the magnification tool at the same location as the pointer
  magnifyCanvas.style.top = `${canvasLocation.y - 0.5 * magnifySize}px`;
  magnifyCanvas.style.left = `${canvasLocation.x - 0.5 * magnifySize}px`;

  magnifyCanvas.style.display = 'block';

  // Hide the mouse cursor, so the user can see better
  document.body.style.cursor = 'none';
}

/** Creates the magnifying glass canvas */
function createMagnificationCanvas (element) {
  // If the magnifying glass canvas doesn't already exist
  if (element.querySelector('.magnifyTool') === null) {
    // Create a canvas and append it as a child to the element
    const magnifyCanvas = document.createElement('canvas');
    // The magnifyTool class is used to find the canvas later on

    magnifyCanvas.classList.add('magnifyTool');

    const config = magnify.getConfiguration();

    magnifyCanvas.width = config.magnifySize;
    magnifyCanvas.height = config.magnifySize;

    // Make sure position is absolute so the canvas can follow the mouse / touch
    magnifyCanvas.style.position = 'absolute';
    element.appendChild(magnifyCanvas);
  }
}

/** Find the magnifying glass canvas and remove it */
function removeMagnificationCanvas (element) {
  const magnifyCanvas = element.querySelector('.magnifyTool');

  if (magnifyCanvas) {
    element.removeChild(magnifyCanvas);
  }
}

// --- Mouse tool activate / disable --- //
function disable (element) {
  element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);
  removeMagnificationCanvas(element);
}

function enable (element) {
  if (!browserName) {
    const infoString = getBrowserInfo();
    const info = infoString.split(' ');

    browserName = info[0];
  }

  createMagnificationCanvas(element);
}

function activate (element, mouseButtonMask) {
  setToolOptions(toolType, element, { mouseButtonMask });

  element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);

  element.addEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);
  createMagnificationCanvas(element);
}

// --- Touch tool activate / disable --- //
function getConfiguration () {
  return configuration;
}

function setConfiguration (config) {
  configuration = config;
}

// Module exports
const magnify = {
  enable,
  activate,
  deactivate: disable,
  disable,
  getConfiguration,
  setConfiguration
};

const options = {
  fireOnTouchStart: true,
  activateCallback: createMagnificationCanvas,
  disableCallback: removeMagnificationCanvas
};

const magnifyTouchDrag = touchDragTool(dragCallback, toolType, options);

export {
  magnify,
  magnifyTouchDrag
};
