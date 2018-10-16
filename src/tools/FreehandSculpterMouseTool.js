import EVENTS from '../events.js';
import external from '../externalModules.js';
import toolColors from '../stateManagement/toolColors.js';
import drawHandles from '../drawing/drawHandles.js';
import { state } from '../store/index.js';
import { getToolState } from '../stateManagement/toolState.js';
import { clipToBox } from '../util/clip.js';
import getToolForElement from '../store/getToolForElement.js';
import BaseTool from '../base/BaseTool.js';

import freehandUtils from '../util/freehand/index.js';

const { FreehandHandleData } = freehandUtils

/**
 * @export @public @class
 * @name FreehandSculpterMouseTool
 * @classdesc Tool for easily sculpting annotations drawn with
 * the FreehandMouseTool.
 * @extends BaseTool
 */
export default class FreehandSculpterMouseTool extends BaseTool {
  constructor (
    name = 'FreehandSculpterMouse',
    referencedToolName = 'FreehandMouse',
    mixins = [
      'activeOrDisabledBinaryTool'
    ]
  ) {
    super({
      name,
      supportedInteractionTypes: ['Mouse'],
      mixins,
      configuration: getDefaultFreehandSculpterMouseToolConfiguration()
    });

    this.hasCursor = true;
    this.referencedToolName = referencedToolName;

    this._active = false;

    // Create bound functions for private event loop.
    this.activeMouseUpCallback = this.activeMouseUpCallback.bind(this);
    this.activeMouseDragCallback = this.activeMouseDragCallback.bind(this);
  }

  /**
   * Event handler for IMAGE_RENDERED event.
   *
   * @event
   * @param {Object} evt - The event.
   */
  renderToolData (evt) {
    const eventData = evt.detail;
    const config = this.configuration;

    if (config.currentTool === null) {
      return false;
    }

    if (this._active) {
      const context = eventData.canvasContext.canvas.getContext('2d');
      const options = {
        fill: null,
        handleRadius: this._toolSizeCanvas
      };

      drawHandles(
        context,
        eventData,
        config.mouseLocation.handles,
        config.dragColor,
        options
      );
    } else if (config.showCursorOnHover) {
      this._renderHoverCursor(evt);
    }
  }

  doubleClickCallback (evt) {
    const eventData = evt.detail;

    this._selectFreehandTool(eventData);

    external.cornerstone.updateImage(eventData.element);
  }

  /**
   * Event handler for MOUSE_DOWN.
   *
   * @param {Object} evt - The event.
   */
  preMouseDownCallback (evt) {
    const eventData = evt.detail;
    const config = this.configuration;

    let imageNeedsUpdate = false;

    if (config.currentTool === null) {
      this._selectFreehandTool(eventData);
    } else {
      this._initialiseSculpting(eventData);
    }

    external.cornerstone.updateImage(eventData.element);

    return true;
  }

  /**
   * Event handler for MOUSE_DRAG during the active loop.
   *
   * @event
   * @param {Object} evt - The event.
   */
  activeMouseDragCallback (evt) {
    const config = this.configuration;

    if (!this._active) {
      return;
    }

    const eventData = evt.detail;
    const toolState = getToolState(eventData.element, this.referencedToolName);

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
   * Event handler for MOUSE_UP during the active loop.
   *
   * @param {Object} evt - The event.
   */
  activeMouseUpCallback (evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    const config = this.configuration;

    this._active = false;

    state.isToolLocked = false;

    this._getMouseLocation(eventData);
    this._invalidateToolData(eventData);

    config.mouseUpRender = true;

    this._deactivateSculpt(element);

    // Update the image
    external.cornerstone.updateImage(eventData.element);

    preventPropagation(evt);
  }

  /**
   * Renders the cursor
   *
   * @private
   * @param  {type} evt description
   */
  _renderHoverCursor (evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    const config = this.configuration;
    const context = eventData.canvasContext.canvas.getContext('2d');

    const toolState = getToolState(element, this.referencedToolName);
    const data = toolState.data[config.currentTool];

    let coords;

    if (config.mouseUpRender) {
      coords = config.mouseLocation.handles.start;
      config.mouseUpRender = false;
    } else {
      coords = state.mousePositionImage;
    }

    const freehandMouseTool = getToolForElement(
      element,
      this.referencedToolName
    );
    let radiusCanvas = freehandMouseTool.distanceFromPointCanvas(
      element,
      data,
      coords
    );

    config.mouseLocation.handles.start.x = coords.x;
    config.mouseLocation.handles.start.y = coords.y;

    if (config.limitRadiusOutsideRegion) {
      const unlimitedRadius = radiusCanvas;

      radiusCanvas = this._limitCursorRadiusCanvas(eventData, radiusCanvas);

      // Fade if distant
      if (unlimitedRadius > config.hoverCursorFadeDistance * radiusCanvas) {
        context.globalAlpha = config.hoverCursorFadeAlpha;
      }
    }

    const options = {
      fill: null,
      handleRadius: radiusCanvas
    };

    drawHandles(
      context,
      eventData,
      config.mouseLocation.handles,
      config.hoverColor,
      options
    );

    if (config.limitRadiusOutsideRegion) {
      context.globalAlpha = 1.0; // Reset drawing alpha for other draw calls.
    }
  }

  /**
   * Event handler for NEW_IMAGE event.
   *
   * @public
   * @param {Object} evt - The event.
   */
  newImageCallback (evt) {
    this._deselectAllTools(evt);
  }

  /**
   * Event handler for switching mode to enabled.
   *
   * @public
   * @param {Object} evt - The event.
   */
  enabledCallback (evt) {
    this._deselectAllTools(evt);
  }

  /**
   * Event handler for switching mode to passive.
   *
   * @public
   * @param {Object} evt - The event.
   */
  passiveCallback (evt) {
    this._deselectAllTools(evt);
  }

  /**
   * Event handler for switching mode to disabled.
   *
   * @public
   * @param {Object} evt - The event.
   */
  disabledCallback (evt) {
    this._deselectAllTools(evt);
  }

  /**
   * Select the freehand tool to be edited.
   *
   * @private
   * @param {Object} eventData - Data object associated with the event.
   */
  _selectFreehandTool (eventData) {
    const config = this.configuration;
    const element = eventData.element;
    const closestToolIndex = this._getClosestFreehandToolOnElement(
      element,
      eventData
    );

    if (closestToolIndex === undefined) {
      return;
    }

    config.currentTool = closestToolIndex;
  }

  /**
   * Activate the selected freehand tool and deactivate others.
   *
   * @private
   * @param {Object} element - The parent element of the freehand tool.
   * @param {Number} toolIndex - The ID of the freehand tool.
   */

  _activateFreehandTool (element, toolIndex) {
    const toolState = getToolState(element, this.referencedToolName);
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
   * @private
   * @param {Object} eventData - Data object associated with the event.
   */
  _initialiseSculpting (eventData) {
    const element = eventData.element;
    const config = this.configuration;

    this._active = true;

    // Interupt event dispatcher
    state.isToolLocked = true;

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
      toolSize: this._toolSizeImage,
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
      const distanceToHandle = external.cornerstoneMath.point.distance(
        dataHandles[i],
        mousePoint
      );

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
      x: mousePoint.x + toolSize * directionUnitVector.x,
      y: mousePoint.y + toolSize * directionUnitVector.y
    };

    clipToBox(position, image);

    handle.x = position.x;
    handle.y = position.y;

    // Push lines
    const lastHandleIndex = this.constructor._getPreviousHandleIndex(
      i,
      dataHandles.length
    );

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
      const handleCanvas = external.cornerstone.pixelToCanvas(
        element,
        dataHandles[i]
      );
      const nextHandleIndex = this.constructor._getNextHandleIndex(
        i,
        dataHandles.length
      );

      const nextHandleCanvas = external.cornerstone.pixelToCanvas(
        element,
        dataHandles[nextHandleIndex]
      );
      const distanceToNextHandleCanvas = external.cornerstoneMath.point.distance(
        handleCanvas,
        nextHandleCanvas
      );

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
    const nextIndex = this.constructor._getNextHandleIndexBeforeInsert(
      insertIndex,
      dataHandles.length
    );
    const insertPosition = this.constructor._getInsertPosition(
      sculptData,
      insertIndex,
      previousIndex,
      nextIndex
    );
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

    if (dataHandles.length > 3) {
      // Don't merge handles if it would destroy the polygon.
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
      const handleCanvas = external.cornerstone.pixelToCanvas(
        element,
        dataHandles[i]
      );
      const nextHandleIndex = this.constructor._getNextHandleIndex(
        i,
        dataHandles.length
      );

      const nextHandleCanvas = external.cornerstone.pixelToCanvas(
        element,
        dataHandles[nextHandleIndex]
      );
      const distanceToNextHandleCanvas = external.cornerstoneMath.point.distance(
        handleCanvas,
        nextHandleCanvas
      );

      if (distanceToNextHandleCanvas < minSpacing) {
        const pair = [i, nextHandleIndex];

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
      const pair = this.constructor._getCorrectedPair(
        closePairs[i],
        removedIndexModifier
      );

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
    const handleAfterPairIndex = this.constructor._getNextHandleIndex(
      handlePair[1],
      dataHandles.length
    );

    dataHandles[handlePair[0]].lines.pop();
    dataHandles[handlePair[0]].lines.push(dataHandles[handleAfterPairIndex]);

    // Remove the latter handle
    dataHandles.splice(handlePair[1], 1);
  }

  /**
   * Calculates the distance to the closest handle in the tool, and stores the
   * result in this._toolSizeImage and this._toolSizeCanvas.
   *
   * @private
   * @param {Object} eventData - Data object associated with the event.
   */
  _configureToolSize (eventData) {
    const element = eventData.element;
    const config = this.configuration;
    const toolIndex = config.currentTool;
    const coords = eventData.currentPoints.image;

    const toolState = getToolState(element, this.referencedToolName);
    const data = toolState.data[toolIndex];

    const freehandMouseTool = getToolForElement(
      element,
      this.referencedToolName
    );

    let radiusImage = freehandMouseTool.distanceFromPoint(
      element,
      data,
      coords
    );
    let radiusCanvas = freehandMouseTool.distanceFromPointCanvas(
      element,
      data,
      coords
    );

    // Check if should limit maximum size.
    if (config.limitRadiusOutsideRegion) {
      radiusImage = this._limitCursorRadiusImage(eventData, radiusImage);
      radiusCanvas = this._limitCursorRadiusCanvas(eventData, radiusCanvas);
    }

    this._toolSizeImage = radiusImage;
    this._toolSizeCanvas = radiusCanvas;
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

    // Begin activeMouseDragCallback loop - call activeMouseUpCallback at end of drag or straight away if just a click.
    element.addEventListener(EVENTS.MOUSE_UP, this.activeMouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_CLICK, this.activeMouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_DRAG, this.activeMouseDragCallback);

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
    element.removeEventListener(EVENTS.MOUSE_UP, this.activeMouseUpCallback);
    element.removeEventListener(EVENTS.MOUSE_CLICK, this.activeMouseUpCallback);
    element.removeEventListener(
      EVENTS.MOUSE_DRAG,
      this.activeMouseDragCallback
    );

    external.cornerstone.updateImage(element);
  }

  /**
   * Invalidate the freehand tool data, tirggering re-calculation of statistics.
   *
   * @private
   * @param {Object} eventData - Data object associated with the event.
   */
  _invalidateToolData (eventData) {
    const config = this.configuration;
    const element = eventData.element;
    const toolData = getToolState(element, this.referencedToolName);
    const data = toolData.data[config.currentTool];

    data.invalidated = true;
  }

  /**
   * Deactivates all freehand ROIs and change currentTool to null
   *
   * @private
   * @param {Object} evt - The event.
   */
  _deselectAllTools (evt) {
    const config = this.configuration;
    const toolData = getToolState(this.element, this.referencedToolName);

    config.currentTool = null;

    if (toolData) {
      for (let i = 0; i < toolData.data.length; i++) {
        toolData.data[i].active = false;
      }
    }

    external.cornerstone.updateImage(this.element);
  }

  /**
   * Given a pair of indicies, and the number of points already removed,
   * convert to the correct live indicies.
   *
   * @private
   * @static
   * @param {Object} pair A pairs of handle indicies.
   * @param {Number} removedIndexModifier The number of handles already removed.
   * @returns {Object} The corrected pair of handle indicies.
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
   * Limits the cursor radius so that it its maximum area is the same as the
   * ROI being sculpted (in canvas coordinates).
   *
   * @private
   * @param  {Object}  eventData    Data object associated with the event.
   * @param  {Number}  radius       The distance from the mouse to the ROI
   *                                in canvas coordinates.
   * @return {Number}               The limited radius in canvas coordinates.
   */
  _limitCursorRadiusCanvas (eventData, radiusCanvas) {
    return this._limitCursorRadius(eventData, radiusCanvas, true);
  }

  /**
   * Limits the cursor radius so that it its maximum area is the same as the
   * ROI being sculpted (in image coordinates).
   *
   * @private
   * @param  {Object}  eventData    Data object associated with the event.
   * @param  {Number}  radius       The distance from the mouse to the ROI
   *                                in image coordinates.
   * @return {Number}               The limited radius in image coordinates.
   */
  _limitCursorRadiusImage (eventData, radiusImage) {
    return this._limitCursorRadius(eventData, radiusImage, false);
  }

  /**
   * Limits the cursor radius so that it its maximum area is the same as the
   * ROI being sculpted.
   *
   * @private
   * @param  {Object}  eventData    Data object associated with the event.
   * @param  {Number}  radius       The distance from the mouse to the ROI.
   * @param  {Boolean} canvasCoords Whether the calculation should be performed
   *                                In canvas coordinates.
   * @return {Number}               The limited radius.
   */
  _limitCursorRadius (eventData, radius, canvasCoords = false) {
    const element = eventData.element;
    const image = eventData.image;
    const config = this.configuration;

    const toolState = getToolState(element, this.referencedToolName);
    const data = toolState.data[config.currentTool];

    let areaModifier = 1.0;

    if (canvasCoords) {
      const topLeft = external.cornerstone.pixelToCanvas(element, {
        x: 0,
        y: 0
      });
      const bottomRight = external.cornerstone.pixelToCanvas(element, {
        x: image.width,
        y: image.height
      });
      const canvasArea =
        (bottomRight.x - topLeft.x) * (bottomRight.y - topLeft.y);

      areaModifier = canvasArea / (image.width * image.height);
    }

    const area = data.area * areaModifier;
    const maxRadius = Math.pow(area / Math.PI, 0.5);

    return Math.min(radius, maxRadius);
  }

  /**
   * Finds the nearest handle to the mouse cursor for all freehand
   * data on the element.
   *
   * @private
   * @param {Object} element - The element.
   * @param {Object} eventData - Data object associated with the event.
   * @return {Number} The tool index of the closest freehand tool.
   */
  _getClosestFreehandToolOnElement (element, eventData) {
    const freehand = getToolForElement(element, this.referencedToolName);
    const toolState = getToolState(element, this.referencedToolName);

    if (!toolState) {
      return;
    }

    const data = toolState.data;
    const pixelCoords = eventData.currentPoints.image;

    const closest = {
      distance: Infinity,
      toolIndex: null
    };

    for (let i = 0; i < data.length; i++) {
      const distanceFromToolI = freehand.distanceFromPoint(
        element,
        data[i],
        pixelCoords
      );

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

    const distanceToMidPoint = external.cornerstoneMath.point.distance(
      mousePoint,
      midPoint
    );

    let insertPosition;

    if (distanceToMidPoint < toolSize) {
      const directionUnitVector = {
        x: (midPoint.x - mousePoint.x) / distanceToMidPoint,
        y: (midPoint.y - mousePoint.y) / distanceToMidPoint
      };

      insertPosition = {
        x: mousePoint.x + toolSize * directionUnitVector.x,
        y: mousePoint.y + toolSize * directionUnitVector.y
      };
    } else {
      insertPosition = midPoint;
    }

    clipToBox(insertPosition, image);

    return insertPosition;
  }

  // ===================================================================
  // Public Configuration API. .
  // ===================================================================

  get minSpacing () {
    return this.configuration.minSpacing;
  }

  set minSpacing (value) {
    if (typeof value !== 'number') {
      throw new Error(
        'Attempting to set freehandSculpter minSpacing to a value other than a number.'
      );
    }

    this.configuration.minSpacing = value;
  }

  get maxSpacing () {
    return this.configuration.maxSpacing;
  }

  set maxSpacing (value) {
    if (typeof value !== 'number') {
      throw new Error(
        'Attempting to set freehandSculpter maxSpacing to a value other than a number.'
      );
    }

    this.configuration.maxSpacing = value;
  }

  get showCursorOnHover () {
    return this.configuration.showCursorOnHover;
  }

  set showCursorOnHover (value) {
    if (typeof value !== 'boolean') {
      throw new Error(
        'Attempting to set freehandSculpter showCursorOnHover to a value other than a boolean.'
      );
    }

    this.configuration.showCursorOnHover = value;
    external.cornerstone.updateImage(this.element);
  }

  get limitRadiusOutsideRegion () {
    return this.configuration.limitRadiusOutsideRegion;
  }

  set limitRadiusOutsideRegion (value) {
    if (typeof value !== 'boolean') {
      throw new Error(
        'Attempting to set freehandSculpter limitRadiusOutsideRegion to a value other than a boolean.'
      );
    }

    this.configuration.limitRadiusOutsideRegion = value;
    external.cornerstone.updateImage(this.element);
  }

  get hoverCursorFadeAlpha () {
    return this.configuration.hoverCursorFadeAlpha;
  }

  set hoverCursorFadeAlpha (value) {
    if (typeof value !== 'number') {
      throw new Error(
        'Attempting to set freehandSculpter hoverCursorFadeAlpha to a value other than a number.'
      );
    }

    // Clamp the value from 0 to 1.
    value = Math.max(Math.min(value, 1.0), 0.0);

    this.configuration.hoverCursorFadeAlpha = value;
    external.cornerstone.updateImage(this.element);
  }

  get hoverCursorFadeDistance () {
    return this.configuration.hoverCursorFadeDistance;
  }

  set hoverCursorFadeDistance (value) {
    if (typeof value !== 'number') {
      throw new Error(
        'Attempting to set freehandSculpter hoverCursorFadeDistance to a value other than a number.'
      );
    }

    // Don't allow to fade a distances smaller than the tool's radius.
    value = Math.max(value, 1.0);

    this.configuration.hoverCursorFadeDistance = value;
    external.cornerstone.updateImage(this.element);
  }
}

/**
 * Returns the default freehandSculpterMouseTool configuration.
 *
 * @return {Object} The default configuration object.
 */
function getDefaultFreehandSculpterMouseToolConfiguration () {
  return {
    mouseLocation: {
      handles: {
        start: {
          highlight: true,
          active: true
        }
      }
    },
    minSpacing: 5,
    maxSpacing: 20,
    currentTool: null,
    dragColor: toolColors.getActiveColor(),
    hoverColor: toolColors.getToolColor(),

    /* --- Hover options ---
    showCursorOnHover:        Shows a preview of the sculpting radius on hover.
    limitRadiusOutsideRegion: Limit max toolsize outside the subject ROI based
                              on subject ROI area.
    hoverCursorFadeAlpha:     Alpha to fade to when tool very distant from
                              subject ROI.
    hoverCursorFadeDistance:  Distance from ROI in which to fade the hoverCursor
                              (in units of radii).
    */
    showCursorOnHover: true,
    limitRadiusOutsideRegion: true,
    hoverCursorFadeAlpha: 0.5,
    hoverCursorFadeDistance: 1.2
  };
}

function preventPropagation (evt) {
  evt.stopImmediatePropagation();
  evt.stopPropagation();
  evt.preventDefault();
}
