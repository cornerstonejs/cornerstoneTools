import EVENTS from '../events.js';
import external from '../externalModules.js';
import { freehand } from './freehand.js';
import triggerEvent from '../util/triggerEvent.js';
import toolColors from '../stateManagement/toolColors.js';
import drawHandles from '../manipulators/drawHandles.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import drawLinkedTextBox from '../util/drawLinkedTextBox.js';
import { addToolState, getToolState } from '../stateManagement/toolState.js';
import { setToolOptions, getToolOptions } from '../toolOptions.js';
import { clipToBox } from '../util/clip.js';
import { keyDownCallback, keyUpCallback } from '../util/freehand/keysHeld.js';
import { FreehandLineFinder } from '../util/freehand/FreehandLineFinder.js';

const toolType = 'freehandSculpter';
const referencedToolType = 'freehand';
let configuration = {
  mouseLocation: {
    handles: {
      start: {
        highlight: true,
        active: true
      }
    }
  },
  keyDown: {
    shift: false,
    ctrl: false,
    alt: false
  },
  active: false,
  spacing: 5,
  toolSize: null,
  currentTool: null,
  color: toolColors.getActiveColor()
};

/**
* Returns a handle of a particular tool if it is close to the mouse cursor
*
* @param {Object} eventData - data object associated with an event.
* @param {Number} toolIndex - the ID of the tool
* @return {Number|Object|Boolean}
*/
function pointNearHandle (eventData, toolIndex) {
  const toolData = getToolState(eventData.element, referencedToolType);
  const config = freehand.getConfiguration();

  if (toolData === undefined) {
    return null;
  }

  const data = toolData.data[toolIndex];

  if (data.handles === undefined) {
    return null;
  }

  if (data.visible === false) {
    return null;
  }

  const mousePoint = eventData.currentPoints.canvas;

  for (let i = 0; i < data.handles.length; i++) {
    const handleCanvas = external.cornerstone.pixelToCanvas(eventData.element, data.handles[i]);

    if (external.cornerstoneMath.point.distance(handleCanvas, mousePoint) < config.spacing) {
      return i;
    }
  }

  return null;
}

/**
* Returns a handle if it is close to the mouse cursor (all tools)
*
* @param {Object} eventData - data object associated with an event.
* @return {Object}
*/
function pointNearHandleAllTools (eventData) {
  const toolData = getToolState(eventData.element, referencedToolType);

  if (!toolData) {
    return;
  }

  let handleNearby;

  for (let toolIndex = 0; toolIndex < toolData.data.length; toolIndex++) {
    handleNearby = pointNearHandle(eventData, toolIndex);
    if (handleNearby !== null) {
      return {
        handleNearby,
        toolIndex
      };
    }
  }
}

// /////// BEGIN ACTIVE TOOL ///////

/**
* Event handler for MOUSE_DOWN event.
*
* @event
* @param {Object} e - The event.
*/
function mouseDownCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;
  const options = getToolOptions(toolType, element);
  const config = freehandSculpter.getConfiguration();
  let imageNeedsUpdate = false;

  if (!isMouseButtonEnabled(eventData.which, options.mouseButtonMask)) {
    e.stopPropagation();
    e.preventDefault();

    return;
  }

  if (eventData.event.ctrlKey) {
    const freehandFinder = new FreehandLineFinder(eventData);
    const toolIndex = freehandFinder.findTool();

    config.currentTool = toolIndex;
    activateFreehandTool(element, toolIndex);
    imageNeedsUpdate = true;

    console.log(`Changed focus to toolIndex: ${toolIndex}`);
  } else {
    if (config.currentTool !== null) {
      config.toolSize = getDistanceToClosestHandleInTool(eventData, config.currentTool);
      console.log(config.toolSize);
      config.active = true;
      console.log('toolActive');

      getMouseLocation(eventData);

      // Begin mouseDragCallback loop - call mouseUpCallback at end of drag or straight away if just a click.
      element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);

      element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
      element.addEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
      element.addEventListener(EVENTS.MOUSE_DRAG, mouseDragCallback);

      imageNeedsUpdate = true;
    }
  }

  console.log(`focused tool: ${config.currentTool}`);

  if (imageNeedsUpdate) {
    // Force onImageRendered
    external.cornerstone.updateImage(eventData.element);
  }
}

function activateFreehandTool (element, toolIndex) {
  const toolData = getToolState(element, referencedToolType);
  for (let i = 0; i < toolData.data.length; i++) {
    if (i === toolIndex) {
      toolData.data[i].active = true;
    } else {
      toolData.data[i].active = false;
    }
  }
}

/**
* Event handler for MOUSE_MOVE event.
*
* @event
* @param {Object} e - The event.
*/
function mouseMoveCallback (e) {
  const eventData = e.detail;
  const toolData = getToolState(eventData.element, referencedToolType);
  const config = freehandSculpter.getConfiguration();
  let imageNeedsUpdate = false;

  if (!toolData) {
    return;
  }

}

function getDistanceToClosestHandleInTool (eventData, toolIndex) {
  const config = freehandSculpter.getConfiguration();
  const toolData = getToolState(eventData.element, referencedToolType);

  const dataHandles = toolData.data[toolIndex].handles;
  const mousePointCanvas = eventData.currentPoints.canvas;

  let closest = Infinity;

  for (let i = 0; i < dataHandles.length; i++) {
    const handlesCanvas = external.cornerstone.pixelToCanvas(eventData.element, dataHandles[i]);
    const distance = external.cornerstoneMath.point.distance(handlesCanvas, mousePointCanvas);
    if (distance < closest) {
      closest = distance;
    }
  }

  return closest;
}

/**
* Event handler for MOUSE_DRAG event.
*
* @event
* @param {Object} e - The event.
*/
function mouseDragCallback (e) {
  const eventData = e.detail;
  const toolData = getToolState(eventData.element, referencedToolType);

  if (!toolData) {
    return;
  }

  const config = freehand.getConfiguration();
  const data = toolData.data[config.currentTool];

  // Set the mouseLocation handle
  getMouseLocation(eventData);

  // Update the image
  external.cornerstone.updateImage(eventData.element);
}

/**
* Event handler for MOUSE_UP event.
*
* @param {Object} e - The event.
*/
function mouseUpCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;
  const config = freehandSculpter.getConfiguration();

  element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
  element.removeEventListener(EVENTS.MOUSE_DRAG, mouseDragCallback);
  element.removeEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);

  element.addEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);

  config.active = false;
  console.log('toolDeactive');

  e.preventDefault();
  e.stopPropagation();

  external.cornerstone.updateImage(eventData.element);
}

/**
* Gets the current mouse location and stores it in the configuration object.
*
* @param {Object} eventData - The data assoicated with the event.
*/
function getMouseLocation (eventData) {
  // Set the mouseLocation handle
  const config = freehandSculpter.getConfiguration();

  config.mouseLocation.handles.start.x = eventData.currentPoints.image.x;
  config.mouseLocation.handles.start.y = eventData.currentPoints.image.y;
  clipToBox(config.mouseLocation.handles.start, eventData.image);
}

// /////// END ACTIVE TOOL ///////

// /////// BEGIN IMAGE RENDERING ///////
/**
* Event handler for IMAGE_RENDERED event.
*
* @event
* @param {Object} e - The event.
*/
function onImageRendered (e) {
  const eventData = e.detail;
  const context = eventData.canvasContext.canvas.getContext('2d');
  const config = freehandSculpter.getConfiguration();

  if (config.active) {
    const options = {
      fill: null,
      handleRadius: config.toolSize
    };

    // Draw large handle at the mouse
    drawHandles(context, eventData, config.mouseLocation.handles, config.color, options);
  }
}

/**
* 'Enables' the tool (disables, only active used as freehandSculpter has none
* of its own data, here so APIs calling a bulk enable don't break).
*
* @param {Object} element - The viewport element to attach event listeners to.
* @modifies {element}
*/
function enable (element) {
  disable(element);
}

/**
* Disables the freehandSculpter.
*
* @param {Object} element - The viewport element to attach event listeners to.
* @modifies {element}
*/
function disable (element) {
  removeEventListeners(element);
  external.cornerstone.updateImage(element);
}

/**
* Attaches event listeners to the element such that is is visible, modifiable, and new data can be created.
*
* @param {Object} element - The viewport element to attach event listeners to.
* @modifies {element}
*/
function activate (element, mouseButtonMask) {
  setToolOptions(toolType, element, { mouseButtonMask });

  // Change freehand to "enable", such that it is visible and interactive by
  // by proxy via freehandSculpter.
  freehand.enable(element);

  removeEventListeners(element);
  element.addEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
  element.addEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
  element.addEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);
  element.addEventListener(EVENTS.KEY_DOWN, keyDownCallback);
  element.addEventListener(EVENTS.KEY_UP, keyUpCallback);

  external.cornerstone.updateImage(element);
}

/**
* 'deactivates' the tool (disables, only active used as freehandSculpter has none
* of its own data, here so APIs calling a bulk deactivate don't break).
*
* @param {Object} element - The viewport element to attach event listeners to.
* @modifies {element}
*/
function deactivate (element, mouseButtonMask) {
  disable(element);
}

/**
* Removes event listeners from the element.
*
* @param {Object} element - The viewport element to remove event listeners from.
* @modifies {element}
*/
function removeEventListeners (element) {
  element.removeEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
  element.removeEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);
  element.removeEventListener(EVENTS.MOUSE_DRAG, mouseDragCallback);
  element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
  element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);
  element.removeEventListener(EVENTS.KEY_DOWN, keyDownCallback);
  element.removeEventListener(EVENTS.KEY_UP, keyUpCallback);
}

/**
* Get the configuation object for the freehand tool.
*
* @return {Object} configuration - The freehand tool's configuration object.
*/
function getConfiguration () {
  return configuration;
}

/**
* Set the configuation object for the freehand tool.
*
* @param {Object} config - The configuration object to set the freehand tool's configuration.
*/
function setConfiguration (config) {
  configuration = config;
}

// Module/private exports
const freehandSculpter = {
  enable,
  disable,
  activate,
  deactivate,
  getConfiguration,
  setConfiguration
};

export { freehandSculpter };
