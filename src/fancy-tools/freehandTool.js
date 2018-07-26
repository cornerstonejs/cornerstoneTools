/* eslint no-loop-func: 0 */ // --> OFF
/* eslint no-underscore-dangle: 0 */
import EVENTS from './../events.js';
import external from './../externalModules.js';
import baseAnnotationTool from './../base/baseAnnotationTool.js';
// State
import { addToolState, getToolState } from './../stateManagement/toolState.js';
import toolStyle from './../stateManagement/toolStyle.js';
import toolColors from './../stateManagement/toolColors.js';
import mouseToolEventDispatcher from './../eventDispatchers/mouseToolEventDispatcher.js';
// Manipulators
import drawHandles from './../manipulators/drawHandles.js';
// Implementation Logic
import pointInsideBoundingBox from '../util/pointInsideBoundingBox.js';
import calculateSUV from '../util/calculateSUV.js';
import dragObject from '../util/freehand/dragObject.js';
import dropObject from '../util/freehand/dropObject.js';
import insertOrDelete from '../util/freehand/insertOrDelete.js';
import freeHandArea from '../util/freehand/freeHandArea.js';
import calculateFreehandStatistics from '../util/freehand/calculateFreehandStatistics.js';
import freeHandIntersect from '../util/freehand/freeHandIntersect.js';
import { FreehandLineFinder } from '../util/freehand/FreehandLineFinder.js';
import { FreehandHandleData } from '../util/freehand/FreehandHandleData.js';
// Drawing
import { getNewContext, draw, drawJoinedLines } from './../util/drawing.js';
import drawLinkedTextBox from './../util/drawLinkedTextBox.js';
import { clipToBox } from '../util/clip.js';

export default class extends baseAnnotationTool {

  constructor (name) {
    super({
      name: name || 'freehand',
      supportedInteractionTypes: ['mouse'],
      configuration: defaultFreehandConfiguration()
    });

    // Create bound functions for callbacks
    this.mouseDownCallback = this.mouseDownCallback.bind(this);
    this.mouseMoveCallback = this.mouseMoveCallback.bind(this);
    this.mouseUpCallback = this.mouseUpCallback.bind(this);
    this.mouseDragCallback = this.mouseDragCallback.bind(this);
  }

  // BEGIN Implementation of baseAnnotationTool methods //

  /**
   * Create the measurement data for this tool
   *
   * @param {*} eventData
   * @returns
   */
  createNewMeasurement (eventData) {

    const goodEventData =
      eventData && eventData.currentPoints && eventData.currentPoints.image;

    if (!goodEventData) {
      console.error(
        `required eventData not supplied to tool ${
          this.name
        }'s createNewMeasurement`
      );

      return;
    }

    const measurementData = {
      visible: true,
      active: true,
      invalidated: true,
      color: undefined,
      handles: []
    };

    measurementData.handles.textBox = {
      active: false,
      hasMoved: false,
      movesIndependently: false,
      drawnIndependently: true,
      allowedOutsideImage: true,
      hasBoundingBox: true
    };

    return measurementData;
  }

  /**
   *
   *
   * @param {*} element
   * @param {*} data
   * @param {*} coords
   * @returns
   */
  pointNearTool (element, data, coords) {
    const validParameters =
      data && data.handles;

    if (!validParameters) {
      console.warn(
        `invalid parameters supplieed to tool ${this.name}'s pointNearTool`
      );
    }

    if (!validParameters || data.visible === false) {
      return false;
    }

    const isPointNearTool = this._pointNearHandle(element, data, coords);

    // JPETTS - if returns index 0, set true (fails first condition as 0 is falsy).
    if (isPointNearTool !== null) {
      return true;
    }

    return false;
  }


  isValidTarget (evt) {
    const eventData = evt.detail;
    
    if (eventData.event.ctrlKey) {
      const freehandLineFinder = new FreehandLineFinder(eventData);
      const insertInfo = freehandLineFinder.findLine();

      if (insertInfo) {
        this._insertInfo = insertInfo;

        return true;
      }
    }

    return false;
  }

  /** // TODO //
   * @param {*} element
   * @param {*} data
   * @param {*} coords
   * @returns {number} the distance in px from the provided coordinates to the
   * closest rendered portion of the annotation. -1 if the distance cannot be
   * calculated.
   */
  distanceFromPoint (element, data, coords) {
    throw new Error('Method distanceFromPoint not implemented in subclass.');
  }

  /**
   *
   *
   * @param {*} evt
   * @returns
   */
  renderToolData (evt) {
    const eventData = evt.detail;

    // If we have no toolData for this element, return immediately as there is nothing to do
    const toolData = getToolState(evt.currentTarget, this.name);

    if (toolData === undefined) {
      return;
    }

    const cornerstone = external.cornerstone;
    const image = eventData.image;
    const element = eventData.element;
    const config = this.configuration;
    const seriesModule = cornerstone.metaData.get('generalSeriesModule', image.imageId);
    let modality;

    if (seriesModule) {
      modality = seriesModule.modality;
    }

    // We have tool data for this element - iterate over each one and draw it
    const context = getNewContext(eventData.canvasContext.canvas);

    const lineWidth = toolStyle.getToolWidth();

    for (let i = 0; i < toolData.data.length; i++) {
      const data = toolData.data[i];

      if (data.visible === false) {
        continue;
      }

      draw(context, (context) => {
        let color = toolColors.getColorIfActive(data);
        let fillColor;

        if (data.active) {
          if (data.handles.invalidHandlePlacement) {
            color = config.invalidColor;
            fillColor = config.invalidColor;
          } else {
            color = toolColors.getColorIfActive(data);
            fillColor = toolColors.getFillColor();
          }

        } else {
          fillColor = toolColors.getToolColor();
        }

        if (data.handles.length) {
          for (let j = 0; j < data.handles.length; j++) {
            const points = [...data.handles[j].lines];

            if (j === (data.handles.length - 1) && !data.polyBoundingBox) {
              // If it's still being actively drawn, keep the last line to
              // The mouse location
              points.push(config.mouseLocation.handles.start);
            }
            drawJoinedLines(context, eventData.element, data.handles[j], points, { color });
          }
        }

        // Draw handles

        const options = {
          fill: fillColor
        };

        if (config.alwaysShowHandles || config.keyDown.ctrl || data.active && data.polyBoundingBox) {
          // Render all handles
          options.handleRadius = config.activeHandleRadius;
          drawHandles(context, eventData, data.handles, color, options);
        }

        if (data.canComplete) {
          // Draw large handle at the origin if can complete drawing
          options.handleRadius = config.completeHandleRadius;
          drawHandles(context, eventData, [data.handles[0]], color, options);
        }

        if (data.active && !data.polyBoundingBox) {
          // Draw handle at origin and at mouse if actively drawing
          options.handleRadius = config.activeHandleRadius;
          drawHandles(context, eventData, config.mouseLocation.handles, color, options);
          drawHandles(context, eventData, [data.handles[0]], color, options);
        }

        // Define variables for the area and mean/standard deviation
        let area,
          meanStdDev,
          meanStdDevSUV;

        // Perform a check to see if the tool has been invalidated. This is to prevent
        // Unnecessary re-calculation of the area, mean, and standard deviation if the
        // Image is re-rendered but the tool has not moved (e.g. during a zoom)
        if (data.invalidated === false) {
          // If the data is not invalidated, retrieve it from the toolData
          meanStdDev = data.meanStdDev;
          meanStdDevSUV = data.meanStdDevSUV;
          area = data.area;
        } else if (!data.active) {
          // If the data has been invalidated, and the tool is not currently active,
          // We need to calculate it again.

          // Retrieve the bounds of the ROI in image coordinates
          const bounds = {
            left: data.handles[0].x,
            right: data.handles[0].x,
            bottom: data.handles[0].y,
            top: data.handles[0].x
          };

          for (let i = 0; i < data.handles.length; i++) {
            bounds.left = Math.min(bounds.left, data.handles[i].x);
            bounds.right = Math.max(bounds.right, data.handles[i].x);
            bounds.bottom = Math.min(bounds.bottom, data.handles[i].y);
            bounds.top = Math.max(bounds.top, data.handles[i].y);
          }

          const polyBoundingBox = {
            left: bounds.left,
            top: bounds.bottom,
            width: Math.abs(bounds.right - bounds.left),
            height: Math.abs(bounds.top - bounds.bottom)
          };

          // Store the bounding box information for the text box
          data.polyBoundingBox = polyBoundingBox;

          // First, make sure this is not a color image, since no mean / standard
          // Deviation will be calculated for color images.
          if (!image.color) {
            // Retrieve the array of pixels that the ROI bounds cover
            const pixels = cornerstone.getPixels(element, polyBoundingBox.left, polyBoundingBox.top, polyBoundingBox.width, polyBoundingBox.height);

            // Calculate the mean & standard deviation from the pixels and the object shape
            meanStdDev = calculateFreehandStatistics.call(this, pixels, polyBoundingBox, data.handles);

            if (modality === 'PT') {
              // If the image is from a PET scan, use the DICOM tags to
              // Calculate the SUV from the mean and standard deviation.

              // Note that because we are using modality pixel values from getPixels, and
              // The calculateSUV routine also rescales to modality pixel values, we are first
              // Returning the values to storedPixel values before calcuating SUV with them.
              // TODO: Clean this up? Should we add an option to not scale in calculateSUV?
              meanStdDevSUV = {
                mean: calculateSUV(image, (meanStdDev.mean - image.intercept) / image.slope),
                stdDev: calculateSUV(image, (meanStdDev.stdDev - image.intercept) / image.slope)
              };
            }

            // If the mean and standard deviation values are sane, store them for later retrieval
            if (meanStdDev && !isNaN(meanStdDev.mean)) {
              data.meanStdDev = meanStdDev;
              data.meanStdDevSUV = meanStdDevSUV;
            }
          }

          // Retrieve the pixel spacing values, and if they are not
          // Real non-zero values, set them to 1
          const columnPixelSpacing = image.columnPixelSpacing || 1;
          const rowPixelSpacing = image.rowPixelSpacing || 1;
          const scaling = columnPixelSpacing * rowPixelSpacing;

          area = freeHandArea(data.handles, scaling);

          // If the area value is sane, store it for later retrieval
          if (!isNaN(area)) {
            data.area = area;
          }

          // Set the invalidated flag to false so that this data won't automatically be recalculated
          data.invalidated = false;
        }

        // Only render text if polygon ROI has been completed and freehand 'shiftKey' mode was not used:
        if (data.polyBoundingBox && !data.handles.textBox.freehand) {
          // If the textbox has not been moved by the user, it should be displayed on the right-most
          // Side of the tool.
          if (!data.handles.textBox.hasMoved) {
            // Find the rightmost side of the polyBoundingBox at its vertical center, and place the textbox here
            // Note that this calculates it in image coordinates
            data.handles.textBox.x = data.polyBoundingBox.left + data.polyBoundingBox.width;
            data.handles.textBox.y = data.polyBoundingBox.top + data.polyBoundingBox.height / 2;
          }

          const text = textBoxText.call(this, data);

          drawLinkedTextBox(context, element, data.handles.textBox, text,
            data.handles, textBoxAnchorPoints, color, lineWidth, 0, true);
        }
      });
    }

    function textBoxText (data) {
      const { meanStdDev, meanStdDevSUV, area } = data;
      // Define an array to store the rows of text for the textbox
      const textLines = [];

      // If the mean and standard deviation values are present, display them
      if (meanStdDev && meanStdDev.mean !== undefined) {
        // If the modality is CT, add HU to denote Hounsfield Units
        let moSuffix = '';

        if (modality === 'CT') {
          moSuffix = ' HU';
        }

        // Create a line of text to display the mean and any units that were specified (i.e. HU)
        let meanText = `Mean: ${this.constructor._numberWithCommas(meanStdDev.mean.toFixed(2))}${moSuffix}`;
        // Create a line of text to display the standard deviation and any units that were specified (i.e. HU)
        let stdDevText = `StdDev: ${this.constructor._numberWithCommas(meanStdDev.stdDev.toFixed(2))}${moSuffix}`;

        // If this image has SUV values to display, concatenate them to the text line
        if (meanStdDevSUV && meanStdDevSUV.mean !== undefined) {
          const SUVtext = ' SUV: ';

          meanText += SUVtext + this.constructor._numberWithCommas(meanStdDevSUV.mean.toFixed(2));
          stdDevText += SUVtext + this.constructor._numberWithCommas(meanStdDevSUV.stdDev.toFixed(2));
        }

        // Add these text lines to the array to be displayed in the textbox
        textLines.push(meanText);
        textLines.push(stdDevText);
      }

      // If the area is a sane value, display it
      if (area) {
        // Determine the area suffix based on the pixel spacing in the image.
        // If pixel spacing is present, use millimeters. Otherwise, use pixels.
        // This uses Char code 178 for a superscript 2
        let suffix = ` mm${String.fromCharCode(178)}`;

        if (!image.rowPixelSpacing || !image.columnPixelSpacing) {
          suffix = ` pixels${String.fromCharCode(178)}`;
        }

        // Create a line of text to display the area and its units
        const areaText = `Area: ${this.constructor._numberWithCommas(area.toFixed(2))}${suffix}`;

        // Add this text line to the array to be displayed in the textbox
        textLines.push(areaText);
      }

      return textLines;
    }

    function textBoxAnchorPoints (handles) {
      return handles;
    }
  }

  // END Implementation of baseAnnotationTool methods //

  /**
  * Event handler for called by the mouseDownActivate event, if tool is active and
  * the event is not caught by mouseDownCallback.
  *
  * @event
  * @param {Object} evt - The event.
  */
  addNewMeasurement (evt, interactionType) {
    if (interactionType === 'touch') {
      console.warn('No touch controls implemented for freehandTool.');

      return;
    }

    const eventData = evt.detail;
    const config = this.configuration;

    config.drawing = true;

    if (eventData.event.shiftKey) {
      config.activePencilMode = true;
    }

    this._startDrawing(eventData);
    this._addPoint(eventData);

    evt.preventDefault();
    evt.stopPropagation();
  }


  /**
  * Event handler for MOUSE_MOVE event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  mouseMoveCallback (evt) {
    const eventData = evt.detail;
    const toolData = getToolState(eventData.element, this.name);

    if (!toolData) {
      return;
    }

    const config = this.configuration;
    const currentTool = config.currentTool;

    // Tool inactive and passively watching for mouse over
    if (currentTool < 0) {
      // TODO -- Is this really needed anymore? Currently just activates if mouse over textBox (I think).
      const imageNeedsUpdate = this.constructor._mouseHover(eventData, toolData);

      if (!imageNeedsUpdate) {
        return;
      }

    } else {
      this._mouseMoveActive(eventData, toolData);
    }

    // Force onImageRendered
    external.cornerstone.updateImage(eventData.element);
  }

  /**
  * Event handler for MOUSE_DOWN event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  mouseDownCallback (evt) {
    const eventData = evt.detail;
    const config = this.configuration;
    const currentTool = config.currentTool;

    if (currentTool < 0) {
      this._mouseDownPassive(evt);
    } else {
      const toolData = getToolState(eventData.element, this.name);

      if (currentTool >= 0 && toolData.data[currentTool].active) {
        this._mouseDownActive(evt, toolData, currentTool);
      }
    }

  }

  /**
  * Event handler for MOUSE_DRAG event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  mouseDragCallback (evt) {
    const eventData = evt.detail;
    const toolData = getToolState(eventData.element, this.name);

    if (!toolData) {
      return;
    }

    const config = this.configuration;
    const data = toolData.data[config.currentTool];
    const currentHandle = config.currentHandle;

    // Set the mouseLocation handle
    this._getMouseLocation(eventData);

    // Check if the tool is active
    if (config.currentTool >= 0) {
      dragObject.call(this, currentHandle, data);
    }

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
    const toolData = getToolState(eventData.element, this.name);


    element.removeEventListener(EVENTS.MOUSE_UP, this.mouseUpCallback);
    element.removeEventListener(EVENTS.MOUSE_DRAG, this.mouseDragCallback);
    element.removeEventListener(EVENTS.MOUSE_CLICK, this.mouseUpCallback);

    if (toolData === undefined) {
      return;
    }

    const dropped = dropObject.call(this, evt, toolData);

    if (dropped === 'handle') {
      this._endDrawing(eventData);
    }

    mouseToolEventDispatcher.setIsAwaitingMouseUp(false);

    evt.preventDefault(); // TODO -- Do we still need this here?
    evt.stopPropagation();


    external.cornerstone.updateImage(eventData.element);
  }

  /**
  * Begining of drawing loop when tool is active and a click event happens far
  * from existing handles.
  *
  * @private
  * @param {Object} eventData - data object associated with an event.
  */
  _startDrawing (eventData) {
    const measurementData = this.createNewMeasurement(eventData);
    const element = eventData.element;
    const config = this.configuration;

    // Block event distpatcher whilst drawing
    mouseToolEventDispatcher.setIsAwaitingMouseUp(true);

    this._referencedElement = element;

    this._activateDraw(element);

    config.mouseLocation.handles.start.x = eventData.currentPoints.image.x;
    config.mouseLocation.handles.start.y = eventData.currentPoints.image.y;

    addToolState(eventData.element, this.name, measurementData);

    const toolData = getToolState(eventData.element, this.name);

    config.currentTool = toolData.data.length - 1;
  }

  /**
  * Adds a point on mouse click in polygon mode.
  *
  * @private
  * @param {Object} eventData - data object associated with an event.
  */
  _addPoint (eventData) {
    const toolData = getToolState(eventData.element, this.name);

    if (toolData === undefined) {
      return;
    }

    // Get the toolData from the last-drawn polygon
    const config = this.configuration;
    const data = toolData.data[config.currentTool];

    if (data.handles.invalidHandlePlacement) {
      return;
    }

    const newHandleData = new FreehandHandleData(eventData.currentPoints.image);

    // If this is not the first handle
    if (data.handles.length) {
      // Add the line from the current handle to the new handle
      data.handles[config.currentHandle - 1].lines.push(eventData.currentPoints.image);
    }

    // Add the new handle
    data.handles.push(newHandleData);

    // Increment the current handle value
    config.currentHandle += 1;

    // Force onImageRendered to fire
    external.cornerstone.updateImage(eventData.element);
  }

  /**
  * If in pencilMode, check the mouse position is farther than the minimum
  * distance between points, then add a point.
  *
  * @private
  * @param {Object} eventData - Data object associated with an event.
  * @param {Object} dataHandles - Data object associated with the tool.
  */
  _addPointPencilMode (eventData, dataHandles) {
    const config = this.configuration;
    const mousePoint = config.mouseLocation.handles.start;

    for (let i = 0; i < dataHandles.length; i++) {
      if (external.cornerstoneMath.point.distance(dataHandles[i], mousePoint) < config.spacing) {
        return;
      }
    }

    this._addPoint(eventData);
  }

  /**
  * Ends the active drawing loop and completes the polygon.
  *
  * @private
  * @param {Object} eventData - data object associated with an event.
  * @param {Object} handleNearby - the handle nearest to the mouse cursor.
  */
  _endDrawing (eventData, handleNearby) {
    const toolData = getToolState(eventData.element, this.name);

    if (!toolData) {
      return;
    }

    const config = this.configuration;

    const data = toolData.data[config.currentTool];

    data.active = false;
    data.highlight = false;
    data.handles.invalidHandlePlacement = false;

    // Connect the end handle to the origin handle
    if (handleNearby !== undefined) {
      data.handles[config.currentHandle - 1].lines.push(data.handles[0]);
    }

    if (config.modifying) {
      config.modifying = false;
      data.invalidated = true;
    }

    // Reset the current handle
    config.currentHandle = 0;
    config.currentTool = -1;
    config.activePencilMode = false;
    data.canComplete = false;

    if (config.drawing) {
      config.drawing = false;
      mouseToolEventDispatcher.setIsAwaitingMouseUp(false);
      this._deactivateDraw(eventData.element);
    }

    external.cornerstone.updateImage(eventData.element);
  }

  /**
  * Returns a handle of a particular tool if it is close to the mouse cursor
  *
  * @private
  * @param {Object} eventData - data object associated with an event.
  * @param {Number} toolIndex - the ID of the tool
  * @return {Number|Object|Boolean}
  */
  _pointNearHandle (element, data, coords) {
    const config = this.configuration;

    if (data.handles === undefined) {
      return null;
    }

    if (data.visible === false) {
      return null;
    }

    for (let i = 0; i < data.handles.length; i++) {
      const handleCanvas = external.cornerstone.pixelToCanvas(element, data.handles[i]);

      if (external.cornerstoneMath.point.distance(handleCanvas, coords) < config.spacing) {
        return i;
      }
    }

    // Check to see if mouse in bounding box of textbox
    if (data.handles.textBox) {
      if (pointInsideBoundingBox(data.handles.textBox, coords)) {
        return data.handles.textBox;
      }
    }

    return null;
  }

  /**
  * Returns a handle if it is close to the mouse cursor (all tools)
  *
  * @private
  * @param {Object} eventData - data object associated with an event.
  * @return {Object}
  */
  _pointNearHandleAllTools (eventData) {
    const element = eventData.element;
    const coords = eventData.currentPoints.canvas;
    const toolData = getToolState(element, this.name);

    if (!toolData) {
      return;
    }

    let handleNearby;

    for (let toolIndex = 0; toolIndex < toolData.data.length; toolIndex++) {
      handleNearby = this._pointNearHandle(element, toolData.data[toolIndex], coords);
      if (handleNearby !== null) {
        return {
          handleNearby,
          toolIndex
        };
      }
    }
  }

  /**
  * Event handler called by mouseDownCallback when the tool is currently deactive.
  *
  * @private
  * @param {Object} evt - The event.
  */
  _mouseDownPassive (evt) {
    const eventData = evt.detail;
    const nearby = this._pointNearHandleAllTools(eventData);

    if (eventData.event.ctrlKey) {
      insertOrDelete.call(this, evt, nearby);
    } else if (nearby !== undefined) {
      this._modifyObject(evt, nearby);
    }
  }

  /**
  * Event handler called by mouseDownCallback when the tool is currently active.
  *
  * @param {Object} evt - The event.
  * @param {Object} toolData - The data object associated with the freehand tool.
  * @param {Number} currentTool - The ID of the active freehand polygon.
  */
  _mouseDownActive (evt, toolData, currentTool) {
    const eventData = evt.detail;
    const config = this.configuration;
    const element = eventData.element;
    const data = toolData.data[currentTool];
    const coords = eventData.currentPoints.canvas;
    const handleNearby = this._pointNearHandle(element, data, coords);

    if (!freeHandIntersect.end(data.handles) && data.canComplete) {
      const lastHandlePlaced = config.currentHandle;

      this._endDrawing(eventData, lastHandlePlaced);
    } else if (handleNearby === null) {
      this._addPoint(eventData);
    }

    evt.preventDefault();
    evt.stopPropagation();

    return;
  }

  /**
  * Event handler called by mouseMoveCallback when the tool is currently active.
  *
  * @private
  * @param {Object} eventData - data object associated with an event.
  * @param {Object} toolData - data object associated with the freehand tool.
  */
  _mouseMoveActive (eventData, toolData) {
    const config = this.configuration;
    const currentTool = config.currentTool;
    const element = eventData.element;
    const data = toolData.data[currentTool];
    const coords = eventData.currentPoints.canvas;

    // Set the mouseLocation handle
    this._getMouseLocation(eventData);
    this._checkInvalidHandleLocation(data);

    if (config.activePencilMode) {
      this._addPointPencilMode(eventData, data.handles);
    } else {
      // No snapping in activePencilMode mode
      const handleNearby = this._pointNearHandle(element, data, coords);

      // If there is a handle nearby to snap to
      // (and it's not the actual mouse handle)
      if (handleNearby !== null && !handleNearby.hasBoundingBox && handleNearby < (data.handles.length - 1)) {
        config.mouseLocation.handles.start.x = data.handles[handleNearby].x;
        config.mouseLocation.handles.start.y = data.handles[handleNearby].y;
      }
    }
  }

  /**
  * Event handler called by mouseDownPassive which modifies a tool's data.
  *
  * @private
  * @param {Object} evt - The event.
  * @param {Object} nearby - Object containing information about a nearby handle.
  */
  _modifyObject (evt, nearby) {
    const eventData = evt.detail;
    const element = eventData.element;
    const toolData = getToolState(eventData.element, this.name);
    const handleNearby = nearby.handleNearby;

    // Interupt eventDispatchers
    mouseToolEventDispatcher.setIsAwaitingMouseUp(true);

    if (handleNearby.hasBoundingBox) {
      this._modifyTextBox(element, nearby);
    } else if (handleNearby !== undefined) {
      this._modifyHandle(element, nearby, toolData);
    }

    evt.preventDefault();
    evt.stopPropagation();
  }

  /**
  * Event handler called by mouseDownPassive which modifies a tool's handle.
  *
  * @private
  * @param {Object} element - The element associated with the event.
  * @param {Object} nearby - Object containing information about a nearby handle.
  * @param {Object} toolData - The data associated with the tool.
  */
  _modifyHandle (element, nearby, toolData) {
    const config = this.configuration;
    const handleNearby = nearby.handleNearby;
    const toolIndex = nearby.toolIndex;

    config.dragOrigin = {
      x: toolData.data[toolIndex].handles[handleNearby].x,
      y: toolData.data[toolIndex].handles[handleNearby].y
    };

    // Begin drag edit - call mouseUpCallback at end of drag or straight away if just a click.
    element.addEventListener(EVENTS.MOUSE_UP, this.mouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_CLICK, this.mouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_DRAG, this.mouseDragCallback);

    config.modifying = true;
    config.currentHandle = handleNearby;
    config.currentTool = toolIndex;
  }

  /**
  * Event handler called by mouseDownPassive which modifies a tool's textBox.
  *
  * @private
  * @param {Object} element - The element associated with the event.
  * @param {Object} nearby - Object containing information about a nearby handle.
  */
  _modifyTextBox (element, nearby) {
    const config = this.configuration;
    const handleNearby = nearby.handleNearby;
    const toolIndex = nearby.toolIndex;

    // Begin drag edit - call mouseUpCallback at end of drag or straight away if just a click.
    element.addEventListener(EVENTS.MOUSE_UP, this.mouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_CLICK, this.mouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_DRAG, this.mouseDragCallback);

    config.movingTextBox = true;
    config.currentHandle = handleNearby;
    config.currentTool = toolIndex;
  }

  /**
  * Gets the current mouse location and stores it in the configuration object.
  *
  * @private
  * @param {Object} eventData - The data assoicated with the event.
  */
  _getMouseLocation (eventData) {
    // Set the mouseLocation handle
    const config = this.configuration;

    config.mouseLocation.handles.start.x = eventData.currentPoints.image.x;
    config.mouseLocation.handles.start.y = eventData.currentPoints.image.y;
    clipToBox(config.mouseLocation.handles.start, eventData.image);
  }

  /**
  * Returns true if the proposed location of a new handle is invalid.
  *
  * @private
  * @param {Object} data - data object associated with the tool.
  * @return {Boolean}
  */
  _checkInvalidHandleLocation (data) {
    const config = this.configuration;

    if (data.handles.length < 2) {
      return true;
    }

    let invalidHandlePlacement;

    if (config.activePencilMode) { // Pencil mode
      invalidHandlePlacement = this._checkHandlesPencilMode(data);
    } else { // Polygon mode
      invalidHandlePlacement = this._checkHandlesPolygonMode(data);
    }

    data.handles.invalidHandlePlacement = invalidHandlePlacement;
  }

  /**
  * Returns true if the proposed location of a new handle is invalid (in polygon mode).
  *
  * @param {Object} data - data object associated with the tool.
  * @return {Boolean}
  */
  _checkHandlesPolygonMode (data) {
    const config = this.configuration;
    const mousePoint = config.mouseLocation.handles.start;
    const dataHandles = data.handles;
    let invalidHandlePlacement = false;

    data.canComplete = false;

    const mouseAtOriginHandle = (external.cornerstoneMath.point.distance(dataHandles[0], mousePoint) < config.spacing);

    if (mouseAtOriginHandle && !freeHandIntersect.end(dataHandles)) {
      data.canComplete = true;
      invalidHandlePlacement = false;
    } else {
      invalidHandlePlacement = freeHandIntersect.newHandle(mousePoint, dataHandles);
    }

    return invalidHandlePlacement;
  }

  /**
  * Returns true if the proposed location of a new handle is invalid (in pencilMode).
  *
  * @private
  * @param {Object} data - data object associated with the tool.
  * @return {Boolean}
  */
  _checkHandlesPencilMode (data) {
    const config = this.configuration;
    const mousePoint = config.mouseLocation.handles.start;
    const dataHandles = data.handles;
    let invalidHandlePlacement = freeHandIntersect.newHandle(mousePoint, dataHandles);

    if (invalidHandlePlacement === false) {
      invalidHandlePlacement = this._invalidHandlePencilMode(data, mousePoint);
    }

    return invalidHandlePlacement;
  }

  /**
  * Returns true if the mouse position is far enough from previous points (in pencilMode).
  *
  * @private
  * @param {Object} data - data object associated with the tool.
  * @param {Object} mousePoint - the position of the mouse cursor.
  * @return {Boolean}
  */
  _invalidHandlePencilMode (data, mousePoint) {
    const config = this.configuration;
    const dataHandles = data.handles;

    if (external.cornerstoneMath.point.distance(dataHandles[0], mousePoint) < config.spacing) {
      data.canComplete = true;

      return false;
    }

    data.canComplete = false;

    // Compare with all other handles appart from the last one
    for (let i = 1; i < dataHandles.length - 1; i++) {
      if (external.cornerstoneMath.point.distance(dataHandles[i], mousePoint) < config.spacing) {
        return true;
      }
    }

    return false;
  }

  /**
  * Activates a particular tool when the mouseCursor is near one if it's handles
  * or it's textBox.
  *
  * @private
  * @static
  * @param {Object} eventData - The data assoicated with the event.
  * @param {Object} toolData - The data associated with the tool.
  */
  static _mouseHover (eventData, toolData) {
    // Check if user is mousing over the textBox
    let imageNeedsUpdate = false;

    for (let i = 0; i < toolData.data.length; i++) {
      // Get the cursor position in canvas coordinates
      const data = toolData.data[i];
      const coords = eventData.currentPoints.canvas;

      if (data.textBox === true) {
        if (pointInsideBoundingBox(data.handles.textBox, coords)) {
          data.active = !data.active;
          data.highlight = !data.highlight;
          imageNeedsUpdate = true;
        }
      }
    }

    return imageNeedsUpdate;
  }

  /**
  * Adds commas as thousand seperators to a Number to increase readability.
  *
  * @private
  * @static
  * @param {Number|String} number - A Number or String literal representing a number.
  * @return {String} - A string literal representaton of the number with commas seperating the thousands.
  */
  static _numberWithCommas (number) {
    // http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
    const parts = number.toString().split('.');

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return parts.join('.');
  }

  /**
  * Attaches event listeners to the element such that is is visible, modifiable, and new data can be created.
  *
  * @private
  * @param {Object} element - The viewport element to attach event listeners to.
  * @modifies {element}
  */
  _activateDraw (element) {
    this._deactivateDraw(element);

    element.addEventListener(EVENTS.MOUSE_DOWN, this.mouseDownCallback);
    element.addEventListener(EVENTS.MOUSE_MOVE, this.mouseMoveCallback);

    external.cornerstone.updateImage(element);
  }

  /**
  * Removes event listeners from the element.
  *
  * @private
  * @param {Object} element - The viewport element to remove event listeners from.
  * @modifies {element}
  */
  _deactivateDraw (element) {
    element.removeEventListener(EVENTS.MOUSE_DOWN, this.mouseDownCallback);
    element.removeEventListener(EVENTS.MOUSE_MOVE, this.mouseMoveCallback);
    element.removeEventListener(EVENTS.MOUSE_DRAG, this.mouseDragCallback);
    element.removeEventListener(EVENTS.MOUSE_UP, this.mouseUpCallback);

    external.cornerstone.updateImage(element);
  }

}

function defaultFreehandConfiguration () {
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
    drawing: false,
    activePencilMode: false,
    spacing: 5,
    activeHandleRadius: 3,
    completeHandleRadius: 6,
    alwaysShowHandles: false,
    invalidColor: 'crimson',
    modifying: false,
    movingTextBox: false,
    currentHandle: 0,
    currentTool: -1
  };
}
