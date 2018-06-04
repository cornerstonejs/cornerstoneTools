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
import { FreehandHandleData } from '../util/freehand/FreehandHandleData.js';

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
    beginSculpting(eventData);
    imageNeedsUpdate = true;
  }

  console.log(`focused tool: ${config.currentTool}`);

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

  console.log(`Changed focus to toolIndex: ${toolIndex}`);
}


/**
* Activate the selected freehand tool and deactivate others.
*
* @param {Object} element - The parent element of the freehand tool.
* @param {Number} toolIndex - The ID of the freehand tool.
*/
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
* Choose the tool radius from the mouse position relative to the active freehand
* tool, and begin sculpting.
*
* @param {Object} eventData - Data object associated with the event.
*/
function beginSculpting (eventData) {
  const config = freehandSculpter.getConfiguration();
  const element = eventData.element;

  getDistanceToClosestHandleInTool(eventData);
  config.active = true;
  console.log('toolActive');

  getMouseLocation(eventData);

  // Begin mouseDragCallback loop - call mouseUpCallback at end of drag or straight away if just a click.
  element.removeEventListener(EVENTS.MOUSE_MOVE, mouseMoveCallback);

  element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
  element.addEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
  element.addEventListener(EVENTS.MOUSE_DRAG, mouseDragCallback);
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

  if (!toolData) {
    return;
  }

}

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

  console.log(config.toolSizeImage);
  console.log(config.toolSizeCanvas);
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
  sculpt(eventData, dataHandles);

  // Update the image
  external.cornerstone.updateImage(eventData.element);
}

function sculpt (eventData, dataHandles) {
  const element = eventData.element;
  const config = freehandSculpter.getConfiguration();
  const toolSize = config.toolSizeImage;
  const mousePoint = eventData.currentPoints.image;

  pushHandles(dataHandles, toolSize, mousePoint);
  insertNewHandles(eventData, dataHandles);

  if (dataHandles.length > 3) { // Don't merge handles if it would destroy the polygon.
    const closePairs = findCloseHandlePairs(element, dataHandles);

    mergeCloseHandles(eventData, dataHandles, closePairs);
    console.log(`closePairs: ${closePairs.length}`);
    console.log();
  }

  // TODO Cycle around points and combine close
  //      Points (really delete one and move another).
}

function pushHandles (dataHandles, toolSize, mousePoint) {
  for (let i = 0; i < dataHandles.length; i++) {
    // Push point if inside circle, to edge of circle.
    const handle = dataHandles[i];
    const distanceToHandle = external.cornerstoneMath.point.distance(handle, mousePoint);

    if (distanceToHandle < toolSize) {
      // Push handle

      const directionUnitVector = {
        x: (handle.x - mousePoint.x) / distanceToHandle,
        y: (handle.y - mousePoint.y) / distanceToHandle
      };

      handle.x = mousePoint.x + (toolSize * directionUnitVector.x);
      handle.y = mousePoint.y + (toolSize * directionUnitVector.y);

      // Push lines
      let lastHandleId;

      if (i === 0) {
        lastHandleId = dataHandles.length - 1;
      } else {
        lastHandleId = i - 1;
      }

      dataHandles[lastHandleId].lines.pop();
      dataHandles[lastHandleId].lines.push(handle);
    }
  }
}

function insertNewHandles (eventData, dataHandles) {
  const element = eventData.element;
  const indiciesToInsertAfter = findNewHandleIndicies(element, dataHandles);
  let newIndexModifier = 0;

  for (let i = 0; i < indiciesToInsertAfter.length; i++) {
    const insertIndex = indiciesToInsertAfter[i] + 1 + newIndexModifier;

    insertHandleRadially(eventData, dataHandles, insertIndex);
    newIndexModifier++;
  }
}

function mergeCloseHandles (eventData, dataHandles, closePairs) {
  const element = eventData.element;
  let removedIndexModifier = 0;

  for (let i = 0; i < closePairs.length; i++) {
    const pair = [
      closePairs[i][0] - removedIndexModifier,
      closePairs[i][1] - removedIndexModifier
    ];

    combineHandles(eventData, dataHandles, pair);
    removedIndexModifier++;
  }

  // Recursively remove problem childs
  const newClosePairs = findCloseHandlePairs(element, dataHandles);

  console.log(`newClosePairs: ${newClosePairs.length}`);
  if (closePairs.length) {
    mergeCloseHandles(eventData, dataHandles, newClosePairs);
  }
}

function findNewHandleIndicies (element, dataHandles) {
  const config = freehandSculpter.getConfiguration();
  const maxSpacing = config.maxSpacing;
  const indiciesToInsertAfter = [];

  for (let i = 0; i < dataHandles.length; i++) {
    const handleCanvas = external.cornerstone.pixelToCanvas(element, dataHandles[i]);
    let nextHandleCanvas;

    if (i === dataHandles.length - 1) {
      nextHandleCanvas = external.cornerstone.pixelToCanvas(element, dataHandles[0]);
    } else {
      nextHandleCanvas = external.cornerstone.pixelToCanvas(element, dataHandles[i + 1]);
    }

    const distanceToNextHandleCanvas = external.cornerstoneMath.point.distance(handleCanvas, nextHandleCanvas);

    if (distanceToNextHandleCanvas > maxSpacing) {
      indiciesToInsertAfter.push(i);
    }
  }

  return indiciesToInsertAfter;
}

function findCloseHandlePairs (element, dataHandles) {
  const config = freehandSculpter.getConfiguration();
  const minSpacing = config.minSpacing;
  const closePairs = [];
  let length = dataHandles.length;

  for (let i = 0; i < length; i++) {
    const handleCanvas = external.cornerstone.pixelToCanvas(element, dataHandles[i]);
    let nextHandleId;

    if (i === dataHandles.length - 1) {
      nextHandleId = 0;
    } else {
      nextHandleId = i + 1;
    }

    const nextHandleCanvas = external.cornerstone.pixelToCanvas(element, dataHandles[nextHandleId]);
    const distanceToNextHandleCanvas = external.cornerstoneMath.point.distance(handleCanvas, nextHandleCanvas);

    if (distanceToNextHandleCanvas < minSpacing) {
      closePairs.push([
        i,
        nextHandleId
      ]);
      i++; // Don't double count pairs in order to prevent your polygon collapsing to a singularity.

      if (i === 0) {
        length -= 1; // Don't check last node if first in pair to avoid double counting.
      }
    }
  }

  return closePairs;
}

function combineHandles (eventData, dataHandles, handlePair) {
  // Calculate combine position: half way between the handles.
  const midPoint = {
    x: (dataHandles[handlePair[0]].x + dataHandles[handlePair[1]].x) / 2.0,
    y: (dataHandles[handlePair[0]].y + dataHandles[handlePair[1]].y) / 2.0
  };

  // Move first point to midpoint
  dataHandles[handlePair[0]].x = midPoint.x;
  dataHandles[handlePair[0]].y = midPoint.y;

  // Link first point to handle that second point links to.
  let handleAfterPairId;

  if (handlePair[1] === dataHandles.length - 1) {
    handleAfterPairId = 0;
  } else {
    handleAfterPairId = handlePair[1] + 1;
  }

  dataHandles[handlePair[0]].lines.pop();
  dataHandles[handlePair[0]].lines.push(dataHandles[handleAfterPairId]);

  // Remove the handle
  dataHandles.splice(handlePair[1], 1);
}

function insertHandleRadially (eventData, dataHandles, insertIndex) {
  const config = freehandSculpter.getConfiguration();
  const toolSize = config.toolSizeImage;
  const mousePoint = eventData.currentPoints.image;
  const previousIndex = insertIndex - 1;
  let nextIndex;

  if (insertIndex === dataHandles.length) {
    nextIndex = 0;
  } else {
    // A 'GOTCHA' here: The line bellow is correct, as we haven't inserted our handle yet!
    nextIndex = insertIndex;
  }

  // Calculate insert position: half way between the handles, then pushed out
  // Radially to the edge of the freehandSculpter.
  const midPoint = {
    x: (dataHandles[previousIndex].x + dataHandles[nextIndex].x) / 2.0,
    y: (dataHandles[previousIndex].y + dataHandles[nextIndex].y) / 2.0
  };

  const distanceToMidPoint = external.cornerstoneMath.point.distance(mousePoint, midPoint);

  const directionUnitVector = {
    x: (midPoint.x - mousePoint.x) / distanceToMidPoint,
    y: (midPoint.y - mousePoint.y) / distanceToMidPoint
  };

  const insertPosition = {
    x: mousePoint.x + (toolSize * directionUnitVector.x),
    y: mousePoint.y + (toolSize * directionUnitVector.y)
  };

  // Add the new handle
  const handleData = new FreehandHandleData(insertPosition);

  dataHandles.splice(insertIndex, 0, handleData);

  // Add the line from the previous handle to the inserted handle (note the tool is now one increment longer)
  dataHandles[previousIndex].lines.pop();
  dataHandles[previousIndex].lines.push(dataHandles[insertIndex]);

  // Add the line from the inserted handle to the handle after
  if (insertIndex === dataHandles.length - 1) {
    dataHandles[insertIndex].lines.push(dataHandles[0]);
  } else {
    dataHandles[insertIndex].lines.push(dataHandles[insertIndex + 1]);
  }
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

  triggerStatisticsCalculation(eventData);
}

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
  const config = freehandSculpter.getConfiguration();
  const toolData = getToolState(element, referencedToolType);

  config.currentTool = null;
  for (let i = 0; i < toolData.data.length; i++) {
    toolData.data[i].active = false;
  }

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
  // By proxy via freehandSculpter.
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
