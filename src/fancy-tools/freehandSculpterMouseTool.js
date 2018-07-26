/* eslint no-underscore-dangle: 0 */
import EVENTS from '../events.js';
import external from '../externalModules.js';
import toolColors from '../stateManagement/toolColors.js';
import drawHandles from '../manipulators/drawHandles.js';
import mouseToolEventDispatcher from '../eventDispatchers/mouseToolEventDispatcher.js';
import { getToolState } from '../stateManagement/toolState.js';
import { clipToBox } from '../util/clip.js';
import { FreehandHandleData } from './shared/freehandUtils/FreehandHandleData.js';
import getTool from '../store/getTool.js';
import isToolActive from './shared/isToolActive.js';
import baseTool from './../base/baseTool.js';

const referencedToolName = 'freehandMouse';

export default class extends baseTool {
  constructor (name) {
    super({
      name: name || 'freehandSculpterMouse',
      supportedInteractionTypes: ['mouse'],
      configuration: getDefaultFreehandSculpterConfiguration()
    });

    // Create bound functions for callbacks
    this.mouseDownCallback = this.mouseDownCallback.bind(this);
    this.mouseUpCallback = this.mouseUpCallback.bind(this);
    this.mouseDragCallback = this.mouseDragCallback.bind(this);
  }

  /**
  * Used to check if there is a valid target for the tool, that
  * isn't necessarily its own toolData. (e.g. the freehandSculpter)
  *
  * @param {*} evt
  * @returns {Boolean} - True if the target is manipulatable by the tool.
  */
  isValidTarget (evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    const config = this.configuration;

    const toolState = getToolState(element, referencedToolName);

    // No valid target if no freehand data!
    if (!toolState) {
      return false;
    }

    // Can only target if active
    if (!isToolActive(element, this.name)) {
      return false;
    }

    if (config.currentTool !== null || eventData.event.ctrlKey) {
      return true;
    }

    return false;
  }

  /**
  * Event handler for IMAGE_RENDERED event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  renderToolData (evt) {
    const eventData = evt.detail;
    const context = eventData.canvasContext.canvas.getContext('2d');
    const config = this.configuration;

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
  * Event handler for MOUSE_DRAG event.
  *
  * @event
  * @param {Object} e - The event.
  */
  mouseDragCallback (evt) {
    const config = this.configuration;

    if (!config.active) {
      return;
    }

    const eventData = evt.detail;
    const toolState = getToolState(eventData.element, referencedToolName);

    if (!toolState) {
      return;
    }

    const dataHandles = toolState.data[config.currentTool].handles;

    // Set the mouseLocation handle
    this._getMouseLocation(eventData);
    this._sculpt(eventData, dataHandles);

    // Update the image
    external.cornerstone.updateImage(eventData.element);
  }

  /**
  * Event handler for MOUSE_UP event.
  *
  * @param {Object} evt - The event.
  */
  mouseUpCallback (evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    const config = this.configuration;

    config.active = false;

    mouseToolEventDispatcher.setIsAwaitingMouseUp(false);

    this._invalidateToolData(eventData);
    this._deactivateSculpt(element);

    evt.stopImmediatePropagation();
    evt.preventDefault();
    evt.stopPropagation();
  }

  /**
  * Event handler for MOUSE_DOWN event.
  *
  * @param {Object} evt - The event.
  */
  mouseDownCallback (evt) {
    const eventData = evt.detail;
    const config = this.configuration;

    let imageNeedsUpdate = false;

    if (eventData.event.ctrlKey) { // Select
      this._selectFreehandTool(eventData);
      imageNeedsUpdate = true;

    } else if (config.currentTool !== null) { // Drag
      this._initialiseSculpting(eventData);
      imageNeedsUpdate = true;
    }

    if (imageNeedsUpdate) {
      // Force onImageRendered
      external.cornerstone.updateImage(eventData.element);
    }
  }

  /**
  * Event handler for passive mode change.
  *
  *
  * @param {Object} element - The element the tool is assoicated with.
  * @param {Object} options - options (unused here)
  */
  passiveCallback (element) {
    this._deselectAllTools(element);
  }

  /**
  * Event handler for enabled mode change.
  *
  *
  * @param {Object} element - The element the tool is assoicated with.
  * @param {Object} options - options (unused here)
  */
  enabledCallback (element) {
    this._deselectAllTools(element);
  }

  /**
  * Event handler for disabled mode change.
  *
  *
  * @param {Object} element - The element the tool is assoicated with.
  * @param {Object} options - options (unused here)
  */
  disabledCallback (element) {
    this._deselectAllTools(element);
  }

  /**
  * Event handler for NEW_IMAGE event.
  *
  * @param {Object} evt - The event.
  */
  onNewImageCallback (evt) {
    const eventData = evt.detail;
    const element = eventData.element;

    this._deselectAllTools(element);
  }

  /**
  * Select the freehand tool to be edited.
  *
  * @private
  * @param {Object} eventData - Data object associated with the event.
  */
  _selectFreehandTool (eventData) {
    const element = eventData.element;
    const closestToolIndex = this.constructor._getClosestFreehandToolOnElement(element, eventData);

    if (closestToolIndex === undefined) {
      return;
    }

    this._activateFreehandTool(element, closestToolIndex);
  }

  /**
  * Activate the selected freehand tool and deactivate others.
  *
  * @private
  * @param {Object} element - The parent element of the freehand tool.
  * @param {Number} toolIndex - The ID of the freehand tool.
  */
  _activateFreehandTool (element, toolIndex) {
    const toolState = getToolState(element, referencedToolName);
    const data = toolState.data;
    const config = this.configuration;

    config.currentTool = toolIndex;

    for (let i = 0; i < data.length; i++) {
      if (i === toolIndex) {
        data[i].active = true;
      } else {
        data[i].active = false;
      }
    }
  }

  /**
  * Choose the tool radius from the mouse position relative to the active freehand
  * tool, and begin sculpting.
  *
  * @param {Object} eventData - Data object associated with the event.
  */
  _initialiseSculpting (eventData) {
    const element = eventData.element;
    const config = this.configuration;

    config.active = true;

    // Interupt event dispatcher
    mouseToolEventDispatcher.setIsAwaitingMouseUp(true);

    this._configureToolSize(eventData);
    this._getMouseLocation(eventData);

    this._activateFreehandTool(element, config.currentTool);
    this._activateSculpt(element);
  }

  /**
  * Sculpts the freehand ROI with the circular freehandSculpter tool, moving,
  * adding and removing handles as necessary.
  *
  * @private
  * @param {Object} eventData - Data object associated with the event.
  * @param {Object} dataHandles - Data object containing tool handle data.
  */
  _sculpt (eventData, dataHandles) {
    const config = this.configuration;

    const sculptData = {
      element: eventData.element,
      image: eventData.image,
      mousePoint: eventData.currentPoints.image,
      dataHandles,
      toolSize: config.toolSizeImage,
      minSpacing: config.minSpacing,
      maxSpacing: config.maxSpacing
    };

    // Push existing handles radially away from tool.
    this._pushHandles(sculptData);
    // Insert new handles in sparsely populated areas.
    this._insertNewHandles(sculptData);
    // If any handles have been pushed very close together or even overlap,
    // Combine these into a single handle.
    this._consolidateHandles(sculptData);
  }

  /**
  * Pushes the handles in dataHandles radially away from the mouse if they are
  * contained within the circle defined by the freehandSculpter's toolSize and
  * the mouse position.
  *
  * @private
  * @param {Object} sculptData - Data object associated with the sculpt event.
  */
  _pushHandles (sculptData) {
    const dataHandles = sculptData.dataHandles;
    const mousePoint = sculptData.mousePoint;
    const toolSize = sculptData.toolSize;

    for (let i = 0; i < dataHandles.length; i++) {

      const distanceToHandle = external.cornerstoneMath.point.distance(dataHandles[i], mousePoint);

      // Push point if inside circle, to edge of circle.
      if (distanceToHandle < toolSize) {
        this._pushOneHandle(sculptData, i, distanceToHandle);
      }
    }
  }

  /**
  * Pushes one handle.
  *
  * @private
  * @param {Object} sculptData - Data object associated with the sculpt event.
  * @param {Number} i - The index of the handle to push.
  * @param {Number} distanceToHandle - The distance between the mouse cursor and the handle.
  */
  _pushOneHandle (sculptData, i, distanceToHandle) {
    const dataHandles = sculptData.dataHandles;
    const handle = dataHandles[i];
    const mousePoint = sculptData.mousePoint;
    const toolSize = sculptData.toolSize;
    const image = sculptData.image;

    const directionUnitVector = {
      x: (handle.x - mousePoint.x) / distanceToHandle,
      y: (handle.y - mousePoint.y) / distanceToHandle
    };

    const position = {
      x: mousePoint.x + (toolSize * directionUnitVector.x),
      y: mousePoint.y + (toolSize * directionUnitVector.y)
    };

    clipToBox(position, image);

    handle.x = position.x;
    handle.y = position.y;

    // Push lines
    const lastHandleIndex = this.constructor._getPreviousHandleIndex(i, dataHandles.length);

    dataHandles[lastHandleIndex].lines.pop();
    dataHandles[lastHandleIndex].lines.push(handle);
  }

  /**
  * Inserts additional handles in sparsely sampled regions of the contour. The
  * new handles are placed on the circle defined by the the freehandSculpter's
  * toolSize and the mouse position.
  * @private
  * @param {Object} sculptData - Data object associated with the sculpt event.
  */
  _insertNewHandles (sculptData) {
    const indiciesToInsertAfter = this._findNewHandleIndicies(sculptData);
    let newIndexModifier = 0;

    for (let i = 0; i < indiciesToInsertAfter.length; i++) {
      const insertIndex = indiciesToInsertAfter[i] + 1 + newIndexModifier;

      this._insertHandleRadially(sculptData, insertIndex); // TODO
      newIndexModifier++;
    }
  }

  /**
  * Returns an array of indicies that describe where new handles should be
  * inserted (where the distance between subsequent handles is >
  * config.maxSpacing).
  *
  * @private
  * @param {Object} sculptData - Data object associated with the sculpt event.
  * @return {Object} An array of indicies that describe where new handles should be inserted.
  */
  _findNewHandleIndicies (sculptData) {
    const element = sculptData.element;
    const dataHandles = sculptData.dataHandles;

    const indiciesToInsertAfter = [];

    for (let i = 0; i < dataHandles.length; i++) {
      const handleCanvas = external.cornerstone.pixelToCanvas(element, dataHandles[i]);
      const nextHandleIndex = this.constructor._getNextHandleIndex(i, dataHandles.length);

      const nextHandleCanvas = external.cornerstone.pixelToCanvas(element, dataHandles[nextHandleIndex]);
      const distanceToNextHandleCanvas = external.cornerstoneMath.point.distance(handleCanvas, nextHandleCanvas);

      if (distanceToNextHandleCanvas > sculptData.maxSpacing) {
        indiciesToInsertAfter.push(i);
      }
    }

    return indiciesToInsertAfter;
  }

  /**
  * Inserts a handle on the surface of the circle defined by toolSize and the
  * mousePoint.
  *
  * @private
  * @param {Object} sculptData - Data object associated with the sculpt event.
  * @param {Object} insertIndex - The index to insert the new handle.
  */
  _insertHandleRadially (sculptData, insertIndex) {
    const dataHandles = sculptData.dataHandles;

    const previousIndex = insertIndex - 1;
    const nextIndex = this.constructor._getNextHandleIndexBeforeInsert(insertIndex, dataHandles.length);
    const insertPosition = this.constructor._getInsertPosition(sculptData, insertIndex, previousIndex, nextIndex);
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
  * Checks dataHandles for any very close handles and consolidates these to a
  * single handle.
  *
  * @private
  * @param {Object} sculptData - Data object associated with the sculpt event.
  */
  _consolidateHandles (sculptData) {
    const dataHandles = sculptData.dataHandles;

    if (dataHandles.length > 3) { // Don't merge handles if it would destroy the polygon.
      const closePairs = this._findCloseHandlePairs(sculptData);

      this._mergeCloseHandles(sculptData, closePairs);
    }
  }

  /**
  * Finds pairs of close handles with seperations < config.minSpacing. No handle
  * is included in more than one pair, to avoid spurious deletion of densely
  * populated regions of the contour (see mergeCloseHandles).
  *
  * @private
  * @param {Object} sculptData - Data object associated with the sculpt event.
  * @return {Object} An array of close pairs in dataHandles.
  */
  _findCloseHandlePairs (sculptData) {
    const dataHandles = sculptData.dataHandles;
    const element = sculptData.element;
    const minSpacing = sculptData.minSpacing;

    const closePairs = [];

    let length = dataHandles.length;

    for (let i = 0; i < length; i++) {
      const handleCanvas = external.cornerstone.pixelToCanvas(element, dataHandles[i]);
      const nextHandleIndex = this.constructor._getNextHandleIndex(i, dataHandles.length);

      const nextHandleCanvas = external.cornerstone.pixelToCanvas(element, dataHandles[nextHandleIndex]);
      const distanceToNextHandleCanvas = external.cornerstoneMath.point.distance(handleCanvas, nextHandleCanvas);

      if (distanceToNextHandleCanvas < minSpacing) {
        const pair = [
          i,
          nextHandleIndex
        ];

        closePairs.push(pair);

        // Don't check last node if first in pair to avoid double counting.
        if (i === 0) {
          length -= 1;
        }

        // Don't double count pairs in order to prevent your polygon collapsing to a singularity.
        i++;
      }
    }

    return closePairs;
  }

  /**
  * Merges handles in dataHandles given a list of close pairs. The handles are
  * merged in an iterative fashion to prevent generating a singularity in some
  * edge cases.
  *
  * @private
  * @param {Object} sculptData - Data object associated with the sculpt event.
  * @param {Object} closePairs - An array of pairs of handle indicies.
  */
  _mergeCloseHandles (sculptData, closePairs) {
    let removedIndexModifier = 0;

    for (let i = 0; i < closePairs.length; i++) {
      const pair = this.constructor._getCorrectedPair(closePairs[i], removedIndexModifier);

      this._combineHandles(sculptData, pair);
      removedIndexModifier++;
    }

    // Recursively remove problem childs
    const newClosePairs = this._findCloseHandlePairs(sculptData);

    if (newClosePairs.length) {
      this._mergeCloseHandles(sculptData, newClosePairs);
    }
  }

  /**
  * Combines two handles defined by the indicies in handlePairs.
  *
  * @private
  * @param {Object} sculptData - Data object associated with the sculpt event.
  * @param {Object} handlePair - A pair of handle indicies.
  */
  _combineHandles (sculptData, handlePair) {
    const dataHandles = sculptData.dataHandles;
    const image = sculptData.image;

    // Calculate combine position: half way between the handles.
    const midPoint = {
      x: (dataHandles[handlePair[0]].x + dataHandles[handlePair[1]].x) / 2.0,
      y: (dataHandles[handlePair[0]].y + dataHandles[handlePair[1]].y) / 2.0
    };

    clipToBox(midPoint, image);

    // Move first point to midpoint
    dataHandles[handlePair[0]].x = midPoint.x;
    dataHandles[handlePair[0]].y = midPoint.y;

    // Link first point to handle that second point links to.
    const handleAfterPairIndex = this.constructor._getNextHandleIndex(handlePair[1], dataHandles.length);

    dataHandles[handlePair[0]].lines.pop();
    dataHandles[handlePair[0]].lines.push(dataHandles[handleAfterPairIndex]);

    // Remove the latter handle
    dataHandles.splice(handlePair[1], 1);
  }

  /**
  * Calculates the distance to the closest handle in the tool, and stores the
  * result in config.toolSizeImage and config.toolSizeCanvas.
  *
  * @param {Object} eventData - Data object associated with the event.
  */
  _configureToolSize (eventData) {
    const element = eventData.element;
    const config = this.configuration;
    const toolIndex = config.currentTool;

    const toolState = getToolState(element, referencedToolName);
    const dataHandles = toolState.data[toolIndex].handles;

    const mousePointImage = eventData.currentPoints.image;
    const mousePointCanvas = eventData.currentPoints.canvas;

    let closestImage = Infinity;
    let closestCanvas = Infinity;

    for (let i = 0; i < dataHandles.length; i++) {
      const handleImage = dataHandles[i];
      const distanceImage = external.cornerstoneMath.point.distance(handleImage, mousePointImage);

      if (distanceImage < closestImage) {
        closestImage = distanceImage;
        const handlesCanvas = external.cornerstone.pixelToCanvas(element, dataHandles[i]);

        closestCanvas = external.cornerstoneMath.point.distance(handlesCanvas, mousePointCanvas);
      }
    }

    config.toolSizeImage = closestImage;
    config.toolSizeCanvas = closestCanvas;
  }

  /**
  * Gets the current mouse location and stores it in the configuration object.
  *
  * @private
  * @param {Object} eventData - The data assoicated with the event.
  */
  _getMouseLocation (eventData) {
    const config = this.configuration;

    config.mouseLocation.handles.start.x = eventData.currentPoints.image.x;
    config.mouseLocation.handles.start.y = eventData.currentPoints.image.y;
    clipToBox(config.mouseLocation.handles.start, eventData.image);
  }


  /**
  * Attaches event listeners to the element such that is is visible, modifiable, and new data can be created.
  *
  * @private
  * @param {Object} element - The viewport element to attach event listeners to.
  * @modifies {element}
  */
  _activateSculpt (element) {
    this._deactivateSculpt(element);

    // Begin mouseDragCallback loop - call mouseUpCallback at end of drag or straight away if just a click.
    element.addEventListener(EVENTS.MOUSE_UP, this.mouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_CLICK, this.mouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_DRAG, this.mouseDragCallback);

    external.cornerstone.updateImage(element);
  }

  /**
  * Removes event listeners from the element.
  *
  * @private
  * @param {Object} element - The viewport element to remove event listeners from.
  * @modifies {element}
  */
  _deactivateSculpt (element) {
    element.removeEventListener(EVENTS.MOUSE_UP, this.mouseUpCallback);
    element.removeEventListener(EVENTS.MOUSE_CLICK, this.mouseUpCallback);
    element.removeEventListener(EVENTS.MOUSE_DRAG, this.mouseDragCallback);

    external.cornerstone.updateImage(element);
  }

  /**
  * Invalidate the freehand tool data, tirggering re-calculation of statistics.
  *
  * @param {Object} eventData - Data object associated with the event.
  */
  _invalidateToolData (eventData) {
    const config = this.configuration;
    const element = eventData.element;
    const toolData = getToolState(element, referencedToolName);
    const data = toolData.data[config.currentTool];

    data.invalidated = true;
  }

  /**
  * Deactivates all freehand ROIs and change currentTool to null
  *
  * @private
  * @param {Object} element - The element on which to deselectAllTools
  */
  _deselectAllTools (element) {
    const config = this.configuration;
    const toolData = getToolState(element, referencedToolName);

    config.currentTool = null;

    if (toolData) {
      for (let i = 0; i < toolData.data.length; i++) {
        toolData.data[i].active = false;
      }
    }

    external.cornerstone.updateImage(element);
  }

  /**
  * Given a pair of indicies, and the number of points already removed,
  * convert to the correct live indicies.
  *
  * @private
  * @static
  * @param {Object} pair - A pairs of handle indicies.
  * @param {Number} removedIndexModifier - The number of handles already removed.
  * @returns {Object} - The corrected pair of handle indicies.
  */
  static _getCorrectedPair (pair, removedIndexModifier) {
    const correctedPair = [
      pair[0] - removedIndexModifier,
      pair[1] - removedIndexModifier
    ];

    // Deal with edge case of last node + first node.
    if (correctedPair[1] < 0) {
      correctedPair[1] = 0;
    }

    return correctedPair;
  }

  /**
  * Finds the nearest handle to the mouse cursor for all freehand
  * data on the element.
  *
  * @private
  * @static
  * @param {Object} element - The element.
  * @param {Object} eventData - Data object associated with the event.
  * @return {Number} The tool index of the closest freehand tool.
  */
  static _getClosestFreehandToolOnElement (element, eventData) {
    const freehand = getTool(element, referencedToolName);
    const toolState = getToolState(element, referencedToolName);
    const data = toolState.data;
    const pixelCoords = eventData.currentPoints.image;

    const closest = {
      distance: Infinity,
      toolIndex: null
    };

    for (let i = 0; i < data.length; i++) {
      const distanceFromToolI = freehand.distanceFromPoint(element, data[i], pixelCoords);

      if (distanceFromToolI === -1) {
        continue;
      }

      if (distanceFromToolI < closest.distance) {
        closest.distance = distanceFromToolI;
        closest.toolIndex = i;
      }
    }

    return closest.toolIndex;
  }

  /**
  * Returns the next handle index.
  *
  * @private
  * @static
  * @param {Number} i - The handle index.
  * @param {Number} length - The length of the polygon.
  * @returns {Number} The next handle index.
  */
  static _getNextHandleIndex (i, length) {
    if (i === length - 1) {
      return 0;
    }

    return i + 1;
  }

  /**
  * Returns the previous handle index.
  *
  * @private
  * @static
  * @param {Number} i - The handle index.
  * @param {Number} length - The length of the polygon.
  * @returns {Number} The previous handle index.
  */
  static _getPreviousHandleIndex (i, length) {
    if (i === 0) {
      return length - 1;
    }

    return i - 1;
  }

  /**
  * Returns the next handle index, with a correction considering a handle is
  * about to be inserted.
  *
  * @private
  * @static
  * @param {Number} insertIndex - The index in which the handle is being inserted.
  * @param {Number} length - The length of the polygon.
  * @returns {Number} The next handle index.
  */
  static _getNextHandleIndexBeforeInsert (insertIndex, length) {
    if (insertIndex === length) {
      return 0;
    }
    // Index correction here: The line bellow is correct, as we haven't inserted our handle yet!

    return insertIndex;
  }

  /**
  * Calculates the position that a new handle should be inserted.
  *
  * @private
  * @static
  * @param {Object} sculptData - Data object associated with the sculpt event.
  * @param {Number} insertIndex - The index to insert the new handle.
  * @param {Number} previousIndex - The previous index.
  * @param {Number} nextIndex - The next index.
  * @returns {Object} The position the handle should be inserted.
  */
  static _getInsertPosition (sculptData, insertIndex, previousIndex, nextIndex) {
    const toolSize = sculptData.toolSize;
    const mousePoint = sculptData.mousePoint;
    const dataHandles = sculptData.dataHandles;
    const image = sculptData.image;

    // Calculate insert position: half way between the handles, then pushed out
    // Radially to the edge of the freehandSculpter.
    const midPoint = {
      x: (dataHandles[previousIndex].x + dataHandles[nextIndex].x) / 2.0,
      y: (dataHandles[previousIndex].y + dataHandles[nextIndex].y) / 2.0
    };

    const distanceToMidPoint = external.cornerstoneMath.point.distance(mousePoint, midPoint);

    let insertPosition;

    if (distanceToMidPoint < toolSize) {
      const directionUnitVector = {
        x: (midPoint.x - mousePoint.x) / distanceToMidPoint,
        y: (midPoint.y - mousePoint.y) / distanceToMidPoint
      };

      insertPosition = {
        x: mousePoint.x + (toolSize * directionUnitVector.x),
        y: mousePoint.y + (toolSize * directionUnitVector.y)
      };
    } else {
      insertPosition = midPoint;
    }

    clipToBox(insertPosition, image);

    return insertPosition;
  }
}


function getDefaultFreehandSculpterConfiguration () {
  return {
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
}
