import EVENTS from '../events.js';
import external from '../externalModules.js';
import { freehand } from './freehand.js';
import toolColors from '../stateManagement/toolColors.js';
import drawHandles from '../manipulators/drawHandles.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';
import { getToolState } from '../stateManagement/toolState.js';
import { setToolOptions, getToolOptions } from '../toolOptions.js';
import { clipToBox } from '../util/clip.js';
import { keyDownCallback, keyUpCallback } from '../util/freehand/keysHeld.js';
import { FreehandLineFinder } from '../util/freehand/FreehandLineFinder.js';
import { Sculpter } from '../util/freehand/Sculpter.js';

const sculpter = new Sculpter();
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
  minSpacing: 5,
  maxSpacing: 20,
  toolSizeImage: null,
  toolSizeCanvas: null,
  currentTool: null,
  color: toolColors.getActiveColor()
};

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
    selectFreehandTool(eventData);
    imageNeedsUpdate = true;
  } else if (config.currentTool !== null) {
    initialiseSculpting(eventData);
    imageNeedsUpdate = true;
  }

  if (imageNeedsUpdate) {
    // Force onImageRendered
    external.cornerstone.updateImage(eventData.element);
  }
}

/**
* Select the freehand tool to be edited.
*
* @param {Object} eventData - Data object associated with the event.
*/
function selectFreehandTool (eventData) {
  const config = freehandSculpter.getConfiguration();
  const element = eventData.element;

  const freehandFinder = new FreehandLineFinder(eventData);
  const toolIndex = freehandFinder.findTool();

  config.currentTool = toolIndex;
  activateFreehandTool(element, toolIndex);
}

/**
* Activate the selected freehand tool and deactivate others.
*
* @param {Object} element - The parent element of the freehand tool.
* @param {Number} toolIndex - The ID of the freehand tool.
* @return {Boolean} True if the tool was activated
*/
function activateFreehandTool (element, toolIndex) {
  const toolData = getToolState(element, referencedToolType);
  const activated = false;

  for (let i = 0; i < toolData.data.length; i++) {
    if (i === toolIndex) {
      toolData.data[i].active = true;
    } else {
      toolData.data[i].active = false;
    }
  }

  return activated;
}

/**
* Choose the tool radius from the mouse position relative to the active freehand
* tool, and begin sculpting.
*
* @param {Object} eventData - Data object associated with the event.
*/
function initialiseSculpting (eventData) {
  const config = freehandSculpter.getConfiguration();
  const element = eventData.element;

  getDistanceToClosestHandleInTool(eventData);
  config.active = true;

  getMouseLocation(eventData);

  // Begin mouseDragCallback loop - call mouseUpCallback at end of drag or straight away if just a click.
  element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
  element.addEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
  element.addEventListener(EVENTS.MOUSE_DRAG, mouseDragCallback);
}

/**
* Calculates the distance to the closest handle in the tool, and stores the
* result in config.toolSizeImage and config.toolSizeCanvas.
*
* @param {Object} eventData - Data object associated with the event.
*/
function getDistanceToClosestHandleInTool (eventData) {
  const config = freehandSculpter.getConfiguration();
  const toolIndex = config.currentTool;
  const toolData = getToolState(eventData.element, referencedToolType);
  const dataHandles = toolData.data[toolIndex].handles;

  const mousePointImage = eventData.currentPoints.image;
  const mousePointCanvas = eventData.currentPoints.canvas;

  let closestImage = Infinity;
  let closestCanvas = Infinity;

  for (let i = 0; i < dataHandles.length; i++) {
    const handleImage = dataHandles[i];
    const distanceImage = external.cornerstoneMath.point.distance(handleImage, mousePointImage);

    if (distanceImage < closestImage) {
      closestImage = distanceImage;
      const handlesCanvas = external.cornerstone.pixelToCanvas(eventData.element, dataHandles[i]);

      closestCanvas = external.cornerstoneMath.point.distance(handlesCanvas, mousePointCanvas);
    }
  }

  config.toolSizeImage = closestImage;
  config.toolSizeCanvas = closestCanvas;
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

  const config = freehandSculpter.getConfiguration();
  const dataHandles = toolData.data[config.currentTool].handles;

  // Set the mouseLocation handle
  getMouseLocation(eventData);
  sculpter.sculpt(eventData, dataHandles);

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

  config.active = false;

  e.preventDefault();
  e.stopPropagation();

  triggerStatisticsCalculation(eventData);
}

/**
* Event handler for NEW_IMAGE event.
*
* @param {Object} e - The event.
*/
function newImageCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  deselectAllTools(element);
}

/**
* Deactivates all freehand ROIs and change currentTool to null
*
* @param {Object} e - The event.
*/
function deselectAllTools (element) {
  const config = freehandSculpter.getConfiguration();
  const toolData = getToolState(element, referencedToolType);

  config.currentTool = null;

  if (toolData) {
    for (let i = 0; i < toolData.data.length; i++) {
      toolData.data[i].active = false;
    }
  }

  external.cornerstone.updateImage(element);
}


/**
* Triggers a re-calculation of a freehand tool's stats after editing.
*
* @param {Object} eventData - Data object associated with the event.
*/
function triggerStatisticsCalculation (eventData) {
  const config = freehandSculpter.getConfiguration();
  const element = eventData.element;
  const toolData = getToolState(element, referencedToolType);
  const data = toolData.data[config.currentTool];

  data.invalidated = true;
  external.cornerstone.updateImage(element);
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
      handleRadius: config.toolSizeCanvas
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
  deselectAllTools(element);
  removeEventListeners(element);
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
  // By proxy via freehandSculpter.
  freehand.enable(element);

  removeEventListeners(element);
  element.addEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
  element.addEventListener(EVENTS.MOUSE_DOWN, mouseDownCallback);
  element.addEventListener(EVENTS.KEY_DOWN, keyDownCallback);
  element.addEventListener(EVENTS.KEY_UP, keyUpCallback);
  element.addEventListener(EVENTS.NEW_IMAGE, newImageCallback);

  element.focus();
  external.cornerstone.updateImage(element);
}

/**
* 'deactivates' the tool (disables, only active used as freehandSculpter has none
* of its own data, here so APIs calling a bulk deactivate don't break).
*
* @param {Object} element - The viewport element to attach event listeners to.
* @modifies {element}
*/
function deactivate (element) {
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
  element.removeEventListener(EVENTS.KEY_DOWN, keyDownCallback);
  element.removeEventListener(EVENTS.KEY_UP, keyUpCallback);
  element.removeEventListener(EVENTS.NEW_IMAGE, newImageCallback);
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
