/* eslint no-loop-func: 0 */ // --> OFF
import EVENTS from './../events.js';
import external from './../externalModules.js';
import BaseAnnotationTool from './../base/BaseAnnotationTool.js';
// State
import { addToolState, getToolState } from './../stateManagement/toolState.js';
import toolStyle from './../stateManagement/toolStyle.js';
import toolColors from './../stateManagement/toolColors.js';
import { state } from '../store/index.js';
// Manipulators
import { moveHandleNearImagePoint } from '../util/findAndMoveHelpers.js';
// Implementation Logic
import pointInsideBoundingBox from '../util/pointInsideBoundingBox.js';
import calculateSUV from '../util/calculateSUV.js';
import numbersWithCommas from '../util/numbersWithCommas.js';

// Drawing
import { getNewContext, draw, drawJoinedLines } from '../drawing/index.js';
import drawLinkedTextBox from '../drawing/drawLinkedTextBox.js';
import drawHandles from '../drawing/drawHandles.js';
import { clipToBox } from '../util/clip.js';

import freehandUtils from '../util/freehand/index.js';

const {
  insertOrDelete,
  freehandArea,
  calculateFreehandStatistics,
  freehandIntersect,
  FreehandHandleData
} = freehandUtils;

/**
 * @export @public @class
 * @name FreehandMouseTool
 * @classdesc Tool for drawing arbitrary polygonal regions of interest, and
 * measuring the statistics of the enclosed pixels.
 * @extends BaseAnnotationTool
 */
export default class FreehandMouseTool extends BaseAnnotationTool {
  constructor (name = 'FreehandMouse') {
    super({
      name,
      supportedInteractionTypes: ['Mouse'],
      configuration: defaultFreehandConfiguration()
    });

    this._drawing = false;
    this._dragging = false;
    this._modifying = false;

    // Create bound callback functions for private event loops
    this._drawingMouseDownCallback = this._drawingMouseDownCallback.bind(this);
    this._drawingMouseMoveCallback = this._drawingMouseMoveCallback.bind(this);
    this._drawingMouseDragCallback = this._drawingMouseDragCallback.bind(this);
    this._drawingMouseUpCallback   = this._drawingMouseUpCallback.bind(this);

    this._editMouseUpCallback = this._editMouseUpCallback.bind(this);
    this._editMouseDragCallback = this._editMouseDragCallback.bind(this);
  }

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
   * @returns {Boolean}
   */
  pointNearTool (element, data, coords) {
    const validParameters = data && data.handles;

    if (!validParameters) {
      throw new Error(
        `invalid parameters supplied to tool ${this.name}'s pointNearTool`
      );
    }

    if (!validParameters || data.visible === false) {
      return false;
    }

    const isPointNearTool = this._pointNearHandle(element, data, coords);

    return isPointNearTool !== undefined;
  }

  /**
   * @param {*} element
   * @param {*} data
   * @param {*} coords
   * @returns {number} the distance in px from the provided coordinates to the
   * closest rendered portion of the annotation. -1 if the distance cannot be
   * calculated.
   */
  distanceFromPoint (element, data, coords) {
    let distance = Infinity;

    for (let i = 0; i < data.handles.length; i++) {
      const distanceI = external.cornerstoneMath.point.distance(
        data.handles[i],
        coords
      );

      distance = Math.min(distance, distanceI);
    }

    // If an error caused distance not to be calculated, return -1.
    if (distance === Infinity) {
      return -1;
    }

    return distance;
  }

  /**
   * @param {*} element
   * @param {*} data
   * @param {*} coords
   * @returns {number} the distance in canvas units from the provided coordinates to the
   * closest rendered portion of the annotation. -1 if the distance cannot be
   * calculated.
   */
  distanceFromPointCanvas (element, data, coords) {
    let distance = Infinity;

    const canvasCoords = external.cornerstone.pixelToCanvas(element, coords);

    const dataHandles = data.handles;

    for (let i = 0; i < dataHandles.length; i++) {
      const handleCanvas = external.cornerstone.pixelToCanvas(
        element,
        dataHandles[i]
      );

      const distanceI = external.cornerstoneMath.point.distance(
        handleCanvas,
        canvasCoords
      );

      distance = Math.min(distance, distanceI);
    }

    // If an error caused distance not to be calculated, return -1.
    if (distance === Infinity) {
      return -1;
    }

    return distance;
  }

  /**
   *
   *
   * @param {*} evt
   * @returns
   */
  renderToolData (evt) {
    const eventData = evt.detail;

    // If we have no toolState for this element, return immediately as there is nothing to do
    const toolState = getToolState(evt.currentTarget, this.name);

    if (!toolState) {
      return;
    }

    const image = eventData.image;
    const element = eventData.element;
    const config = this.configuration;
    const seriesModule = external.cornerstone.metaData.get(
      'generalSeriesModule',
      image.imageId
    );
    let modality;

    if (seriesModule) {
      modality = seriesModule.modality;
    }

    // We have tool data for this element - iterate over each one and draw it
    const context = getNewContext(eventData.canvasContext.canvas);

    const lineWidth = toolStyle.getToolWidth();

    for (let i = 0; i < toolState.data.length; i++) {
      const data = toolState.data[i];

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

            if (j === data.handles.length - 1 && !data.polyBoundingBox) {
              // If it's still being actively drawn, keep the last line to
              // The mouse location
              points.push(config.mouseLocation.handles.start);
            }
            drawJoinedLines(
              context,
              eventData.element,
              data.handles[j],
              points,
              { color }
            );
          }
        }

        // Draw handles

        const options = {
          fill: fillColor
        };

        if (
          config.alwaysShowHandles ||
          (data.active && data.polyBoundingBox)
        ) {
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
          drawHandles(
            context,
            eventData,
            config.mouseLocation.handles,
            color,
            options
          );
          drawHandles(context, eventData, [data.handles[0]], color, options);
        }

        // Define variables for the area and mean/standard deviation
        let area, meanStdDev, meanStdDevSUV;

        // Perform a check to see if the tool has been invalidated. This is to prevent
        // Unnecessary re-calculation of the area, mean, and standard deviation if the
        // Image is re-rendered but the tool has not moved (e.g. during a zoom)
        if (data.invalidated === false) {
          // If the data is not invalidated, retrieve it from the toolState
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
            const pixels = external.cornerstone.getPixels(
              element,
              polyBoundingBox.left,
              polyBoundingBox.top,
              polyBoundingBox.width,
              polyBoundingBox.height
            );

            // Calculate the mean & standard deviation from the pixels and the object shape
            meanStdDev = calculateFreehandStatistics.call(
              this,
              pixels,
              polyBoundingBox,
              data.handles
            );

            if (modality === 'PT') {
              // If the image is from a PET scan, use the DICOM tags to
              // Calculate the SUV from the mean and standard deviation.

              // Note that because we are using modality pixel values from getPixels, and
              // The calculateSUV routine also rescales to modality pixel values, we are first
              // Returning the values to storedPixel values before calcuating SUV with them.
              // TODO: Clean this up? Should we add an option to not scale in calculateSUV?
              meanStdDevSUV = {
                mean: calculateSUV(
                  image,
                  (meanStdDev.mean - image.intercept) / image.slope
                ),
                stdDev: calculateSUV(
                  image,
                  (meanStdDev.stdDev - image.intercept) / image.slope
                )
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

          area = freehandArea(data.handles, scaling);

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
            data.handles.textBox.x =
              data.polyBoundingBox.left + data.polyBoundingBox.width;
            data.handles.textBox.y =
              data.polyBoundingBox.top + data.polyBoundingBox.height / 2;
          }

          const text = textBoxText.call(this, data);

          drawLinkedTextBox(
            context,
            element,
            data.handles.textBox,
            text,
            data.handles,
            textBoxAnchorPoints,
            color,
            lineWidth,
            0,
            true
          );
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
        let meanText = `Mean: ${numbersWithCommas(
          meanStdDev.mean.toFixed(2)
        )}${moSuffix}`;
        // Create a line of text to display the standard deviation and any units that were specified (i.e. HU)
        let stdDevText = `StdDev: ${numbersWithCommas(
          meanStdDev.stdDev.toFixed(2)
        )}${moSuffix}`;

        // If this image has SUV values to display, concatenate them to the text line
        if (meanStdDevSUV && meanStdDevSUV.mean !== undefined) {
          const SUVtext = ' SUV: ';

          meanText +=
            SUVtext + numbersWithCommas(meanStdDevSUV.mean.toFixed(2));
          stdDevText +=
            SUVtext + numbersWithCommas(meanStdDevSUV.stdDev.toFixed(2));
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
        const areaText = `Area: ${numbersWithCommas(area.toFixed(2))}${suffix}`;

        // Add this text line to the array to be displayed in the textbox
        textLines.push(areaText);
      }

      return textLines;
    }

    function textBoxAnchorPoints (handles) {
      return handles;
    }
  }

  /**
   * Event handler for called by the mouseDownActivate event, if tool is active and
   * the event is not caught by mouseDownCallback.
   *
   * @event
   * @param {Object} evt - The event.
   */
  addNewMeasurement (evt, interactionType) {
    const eventData = evt.detail;
    const config = this.configuration;

    this._drawing = true;

    this._startDrawing(eventData);
    this._addPoint(eventData);

    preventPropagation(evt);
  }

  /**
   * Active mouse down callback that takes priority if the user is attempting
   * to insert or delete a handle with ctrl + click.
   *
   * @param {Object} evt - The event.
   */
  preMouseDownCallback (evt) {
    const eventData = evt.detail;
    const nearby = this._pointNearHandleAllTools(eventData);

    if (eventData.event.ctrlKey) {
      if (nearby !== undefined && nearby.handleNearby.hasBoundingBox) {
        // Ctrl + clicked textBox, do nothing but still consume event.
      } else {
        insertOrDelete.call(this, evt, nearby);
      }

      preventPropagation(evt);

      return true;
    }

    return false;
  }

  /**
   * Custom callback for when a handle is selected.
   *
   * @param  {Object} evt
   * @param  {Object} handle The selected handle.
   */
  handleSelectedCallback (evt, handle, data) {
    const eventData = evt.detail;
    const element = eventData.element;
    const toolState = getToolState(eventData.element, this.name);

    if (handle.hasBoundingBox) {
      // Use default move handler.
      moveHandleNearImagePoint(evt, handle, data, this.name);

      return;
    }

    const config = this.configuration;

    config.dragOrigin = {
      x: handle.x,
      y: handle.y
    };

    // Have to do this to get tool index.
    const nearby = this._pointNearHandleAllTools(eventData);
    const handleNearby = nearby.handleNearby;
    const toolIndex = nearby.toolIndex;

    this._modifying = true;
    config.currentHandle = handleNearby;
    config.currentTool = toolIndex;

    this._activateModify(element);

    // Interupt eventDispatchers
    state.isToolLocked = true;

    preventPropagation(evt);
  }

  /**
   * Event handler for MOUSE_MOVE during drawing event loop.
   *
   * @event
   * @param {Object} evt - The event.
   */
  _drawingMouseMoveCallback (evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    const toolState = getToolState(eventData.element, this.name);

    const config = this.configuration;
    const currentTool = config.currentTool;

    const data = toolState.data[currentTool];
    const coords = eventData.currentPoints.canvas;

    // Set the mouseLocation handle
    this._getMouseLocation(eventData);
    this._checkInvalidHandleLocation(data, eventData);

    // Mouse move -> Polygon Mode
    const handleNearby = this._pointNearHandle(element, data, coords);

    // If there is a handle nearby to snap to
    // (and it's not the actual mouse handle)
    if (
      handleNearby !== undefined &&
      !handleNearby.hasBoundingBox &&
      handleNearby < data.handles.length - 1
    ) {
      config.mouseLocation.handles.start.x = data.handles[handleNearby].x;
      config.mouseLocation.handles.start.y = data.handles[handleNearby].y;
    }

    // Force onImageRendered
    external.cornerstone.updateImage(eventData.element);
  }

  /**
   * Event handler for MOUSE_DRAG during drawing event loop.
   *
   * @event
   * @param {Object} evt - The event.
   */
  _drawingMouseDragCallback (evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    const toolState = getToolState(eventData.element, this.name);

    const config = this.configuration;
    const currentTool = config.currentTool;

    const data = toolState.data[currentTool];
    const coords = eventData.currentPoints.canvas;

    // Set the mouseLocation handle
    this._getMouseLocation(eventData);
    this._checkInvalidHandleLocation(data, eventData);
    this._addPointPencilMode(eventData, data.handles);
    this._dragging = true;

    // Force onImageRendered
    external.cornerstone.updateImage(eventData.element);
  }


  /**
   * Event handler for MOUSE_UP during drawing event loop.
   *
   * @event
   * @param {Object} evt - The event.
   */
  _drawingMouseUpCallback(evt) {
    if (!this._dragging) {
      return;
    }

    this._dragging = false;

    const eventData = evt.detail;
    const element = eventData.element;
    const coords = eventData.currentPoints.canvas;

    const config = this.configuration;
    const currentTool = config.currentTool;
    const toolState = getToolState(eventData.element, this.name);
    const data = toolState.data[currentTool];

    const handleNearby = this._pointNearHandle(element, data, coords);

    if (!freehandIntersect.end(data.handles) && data.canComplete) {
      const lastHandlePlaced = config.currentHandle;

      this._endDrawing(element, lastHandlePlaced);
    }

    preventPropagation(evt);

    return;
  }

  /**
   * Event handler for MOUSE_DOWN during drawing event loop.
   *
   * @event
   * @param {Object} evt - The event.
   */
  _drawingMouseDownCallback (evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    const coords = eventData.currentPoints.canvas;

    const config = this.configuration;
    const currentTool = config.currentTool;
    const toolState = getToolState(eventData.element, this.name);
    const data = toolState.data[currentTool];

    const handleNearby = this._pointNearHandle(element, data, coords);

    if (!freehandIntersect.end(data.handles) && data.canComplete) {
      const lastHandlePlaced = config.currentHandle;

      this._endDrawing(element, lastHandlePlaced);
    } else if (handleNearby === undefined) {
      this._addPoint(eventData);
    }

    preventPropagation(evt);

    return;
  }

  /**
   * Event handler for MOUSE_DRAG during handle drag event loop.
   *
   * @event
   * @param {Object} evt - The event.
   */
  _editMouseDragCallback (evt) {
    const eventData = evt.detail;
    const toolState = getToolState(eventData.element, this.name);

    const config = this.configuration;
    const data = toolState.data[config.currentTool];
    const currentHandle = config.currentHandle;

    // Set the mouseLocation handle
    this._getMouseLocation(eventData);

    data.handles.invalidHandlePlacement = freehandIntersect.modify(
      data.handles,
      currentHandle
    );
    data.active = true;
    data.highlight = true;
    data.handles[currentHandle].x = config.mouseLocation.handles.start.x;
    data.handles[currentHandle].y = config.mouseLocation.handles.start.y;

    if (currentHandle !== 0) {
      const lastLineIndex = data.handles[currentHandle - 1].lines.length - 1;
      const lastLine = data.handles[currentHandle - 1].lines[lastLineIndex];

      lastLine.x = config.mouseLocation.handles.start.x;
      lastLine.y = config.mouseLocation.handles.start.y;
    }

    // Update the image
    external.cornerstone.updateImage(eventData.element);
  }

  /**
   * Event handler for MOUSE_UP during handle drag event loop.
   *
   * @param {Object} evt - The event.
   */
  _editMouseUpCallback (evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    const toolState = getToolState(eventData.element, this.name);

    this._deactivateModify(element);

    this._dropHandle(eventData, toolState);
    this._endDrawing(element);

    state.isToolLocked = false;

    external.cornerstone.updateImage(eventData.element);
  }

  /**
   * Places a handle of the freehand tool if the new location is valid.
   * If the new location is invalid the handle snaps back to its previous position.
   *
   * @param {Object} eventData - Data object associated with the event.
   * @param {Object} toolState - The data associated with the freehand tool.
   * @modifies {toolState}
   */
  _dropHandle (eventData, toolState) {
    const config = this.configuration;
    const currentTool = config.currentTool;

    const dataHandles = toolState.data[currentTool].handles;

    // Don't allow the line being modified to intersect other lines
    if (dataHandles.invalidHandlePlacement) {
      const currentHandle = config.currentHandle;
      const currentHandleData = dataHandles[currentHandle];
      let previousHandleData;

      if (currentHandle === 0) {
        const lastHandleID = dataHandles.length - 1;

        previousHandleData = dataHandles[lastHandleID];
      } else {
        previousHandleData = dataHandles[currentHandle - 1];
      }

      // Snap back to previous position
      currentHandleData.x = config.dragOrigin.x;
      currentHandleData.y = config.dragOrigin.y;
      previousHandleData.lines[0] = currentHandleData;

      dataHandles.invalidHandlePlacement = false;
    }
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
    state.isToolLocked = true;

    this._referencedElement = element;

    this._activateDraw(element);
    this._getMouseLocation(eventData);

    addToolState(eventData.element, this.name, measurementData);

    const toolState = getToolState(eventData.element, this.name);

    config.currentTool = toolState.data.length - 1;
  }

  /**
   * Adds a point on mouse click in polygon mode.
   *
   * @private
   * @param {Object} eventData - data object associated with an event.
   */
  _addPoint (eventData) {
    const toolState = getToolState(eventData.element, this.name);

    // Get the toolState from the last-drawn polygon
    const config = this.configuration;
    const data = toolState.data[config.currentTool];

    if (data.handles.invalidHandlePlacement) {
      return;
    }

    const newHandleData = new FreehandHandleData(eventData.currentPoints.image);

    // If this is not the first handle
    if (data.handles.length) {
      // Add the line from the current handle to the new handle
      data.handles[config.currentHandle - 1].lines.push(
        eventData.currentPoints.image
      );
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
    const element = eventData.element;
    const mousePoint = config.mouseLocation.handles.start;

    const handleFurtherThanMinimumSpacing = ((handle) => {
      return this._isDistanceLargerThanSpacingCanvas(element, handle, mousePoint);
    }).bind(this);

    if (dataHandles.every(handleFurtherThanMinimumSpacing)) {
      this._addPoint(eventData);
    }
  }

  /**
   * Ends the active drawing loop and completes the polygon.
   *
   * @private
   * @param {Object} element - The element on which the roi is being drawn.
   * @param {Object} handleNearby - the handle nearest to the mouse cursor.
   */
  _endDrawing (element, handleNearby) {
    const toolState = getToolState(element, this.name);

    const config = this.configuration;

    const data = toolState.data[config.currentTool];

    data.active = false;
    data.highlight = false;
    data.handles.invalidHandlePlacement = false;

    // Connect the end handle to the origin handle
    if (handleNearby !== undefined) {
      data.handles[config.currentHandle - 1].lines.push(data.handles[0]);
    }

    if (this._modifying) {
      this._modifying = false;
      data.invalidated = true;
    }

    // Reset the current handle
    config.currentHandle = 0;
    config.currentTool = -1;
    data.canComplete = false;

    if (this._drawing) {
      this._drawing = false;
      state.isToolLocked = false;
      this._deactivateDraw(element);
    }

    external.cornerstone.updateImage(element);
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
      return;
    }

    if (data.visible === false) {
      return;
    }

    for (let i = 0; i < data.handles.length; i++) {
      const handleCanvas = external.cornerstone.pixelToCanvas(
        element,
        data.handles[i]
      );

      if (
        external.cornerstoneMath.point.distance(handleCanvas, coords) <
        config.spacing
      ) {
        return i;
      }
    }

    // Check to see if mouse in bounding box of textbox
    if (data.handles.textBox) {
      if (pointInsideBoundingBox(data.handles.textBox, coords)) {
        return data.handles.textBox;
      }
    }
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
    const toolState = getToolState(element, this.name);

    if (!toolState) {
      return;
    }

    let handleNearby;

    for (let toolIndex = 0; toolIndex < toolState.data.length; toolIndex++) {
      handleNearby = this._pointNearHandle(
        element,
        toolState.data[toolIndex],
        coords
      );
      if (handleNearby !== undefined) {
        return {
          handleNearby,
          toolIndex
        };
      }
    }
  }

  /**
   * Gets the current mouse location and stores it in the configuration object.
   *
   * @private
   * @param {Object} eventData The data assoicated with the event.
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
   * @param {Object} data      Data object associated with the tool.
   * @param {Object} eventData The data assoicated with the event.
   * @return {Boolean}
   */
  _checkInvalidHandleLocation (data, eventData) {
    const config = this.configuration;

    if (data.handles.length < 2) {
      return true;
    }

    let invalidHandlePlacement;

    if (this._dragging) {
      invalidHandlePlacement = this._checkHandlesPencilMode(data, eventData);
    } else {
      invalidHandlePlacement = this._checkHandlesPolygonMode(data, eventData);
    }

    data.handles.invalidHandlePlacement = invalidHandlePlacement;
  }

  /**
   * Returns true if the proposed location of a new handle is invalid (in polygon mode).
   *
   * @param {Object} data - data object associated with the tool.
   * @param {Object} eventData The data assoicated with the event.
   * @return {Boolean}
   */
  _checkHandlesPolygonMode (data, eventData) {
    const config = this.configuration;
    const element = eventData.element;
    const mousePoint = config.mouseLocation.handles.start;
    const dataHandles = data.handles;
    let invalidHandlePlacement = false;

    data.canComplete = false;

    const mouseAtOriginHandle = this._isDistanceSmallerThanSpacingCanvas(
      element,
      dataHandles[0],
      mousePoint
    );

    if (mouseAtOriginHandle && !freehandIntersect.end(dataHandles)) {
      data.canComplete = true;
      invalidHandlePlacement = false;
    } else {
      invalidHandlePlacement = freehandIntersect.newHandle(
        mousePoint,
        dataHandles
      );
    }

    return invalidHandlePlacement;
  }

  /**
   * Returns true if the proposed location of a new handle is invalid (in pencilMode).
   *
   * @private
   * @param {Object} data - data object associated with the tool.
   * @param {Object} eventData The data associated with the event.
   * @return {Boolean}
   */
  _checkHandlesPencilMode (data, eventData) {
    const config = this.configuration;
    const mousePoint = config.mouseLocation.handles.start;
    const dataHandles = data.handles;
    let invalidHandlePlacement = freehandIntersect.newHandle(
      mousePoint,
      dataHandles
    );

    if (invalidHandlePlacement === false) {
      invalidHandlePlacement = this._invalidHandlePencilMode(data, eventData);
    }

    return invalidHandlePlacement;
  }

  /**
   * Returns true if the mouse position is far enough from previous points (in pencilMode).
   *
   * @private
   * @param {Object} data - data object associated with the tool.
   * @param {Object} eventData The data associated with the event.
   * @return {Boolean}
   */
  _invalidHandlePencilMode (data, eventData) {
    const config = this.configuration;
    const element = eventData.element;
    const mousePoint = config.mouseLocation.handles.start;
    const dataHandles = data.handles;

    const mouseAtOriginHandle = this._isDistanceSmallerThanSpacingCanvas(
      element,
      dataHandles[0],
      mousePoint
    );

    if (mouseAtOriginHandle) {
      data.canComplete = true;

      return false;
    }

    data.canComplete = false;

    // Compare with all other handles appart from the last one
    for (let i = 1; i < dataHandles.length - 1; i++) {
      if (this._isDistanceSmallerThanSpacingCanvas(
        element,
        dataHandles[i],
        mousePoint
      )) {
        return true;
      }
    }

    return false;
  }

  /**
   * Returns true if two points are closer than this.configuration.spacing.
   *
   * @private
   * @param  {Object} element     The element on which the roi is being drawn.
   * @param  {Object} p1          The first point, in pixel space.
   * @param  {Object} p2          The second point, in pixel space.
   * @return {boolean}            True if the distance is smaller than the
   *                              allowed canvas spacing.
   */
  _isDistanceSmallerThanSpacingCanvas (element, p1, p2) {
    return this._compareDistanceToSpacingCanvas(element, p1, p2, '<');
  }

  /**
   * Returns true if two points are farther than this.configuration.spacing.
   *
   * @private
   * @param  {Object} element     The element on which the roi is being drawn.
   * @param  {Object} p1          The first point, in pixel space.
   * @param  {Object} p2          The second point, in pixel space.
   * @return {boolean}            True if the distance is smaller than the
   *                              allowed canvas spacing.
   */
  _isDistanceLargerThanSpacingCanvas (element, p1, p2) {
    return this._compareDistanceToSpacingCanvas(element, p1, p2, '>');
  }

  /**
   * Compares the distance between two points to this.configuration.spacing.
   *
   * @private
   * @param  {Object} element     The element on which the roi is being drawn.
   * @param  {Object} p1          The first point, in pixel space.
   * @param  {Object} p2          The second point, in pixel space.
   * @param  {string} comparison  The comparison to make.
   * @return {boolean}            True if the distance is smaller than the
   *                              allowed canvas spacing.
   */
  _compareDistanceToSpacingCanvas (element, p1, p2, comparison = '>') {
    const config = this.configuration;

    const p1Canvas = external.cornerstone.pixelToCanvas(
      element,
      p1
    );
    const p2Canvas = external.cornerstone.pixelToCanvas(
      element,
      p2
    );

    let result;

    if (comparison === '>') {
      result = external.cornerstoneMath.point.distance(p1, p2) >
      config.spacing
    } else {
      result = external.cornerstoneMath.point.distance(p1, p2) <
      config.spacing
    }

    return result;
  }


  /**
   * Adds drawing loop event listeners.
   *
   * @private
   * @param {Object} element - The viewport element to add event listeners to.
   * @modifies {element}
   */
  _activateDraw (element) {
    // Polygonal Mode
    element.addEventListener(EVENTS.MOUSE_DOWN, this._drawingMouseDownCallback);
    element.addEventListener(EVENTS.MOUSE_MOVE, this._drawingMouseMoveCallback);

    // Drag/Pencil Mode
    element.addEventListener(EVENTS.MOUSE_DRAG, this._drawingMouseDragCallback);
    element.addEventListener(EVENTS.MOUSE_UP, this._drawingMouseUpCallback);

    external.cornerstone.updateImage(element);
  }

  /**
   * Removes drawing loop event listeners.
   *
   * @private
   * @param {Object} element - The viewport element to add event listeners to.
   * @modifies {element}
   */
  _deactivateDraw (element) {
    element.removeEventListener(
      EVENTS.MOUSE_DOWN,
      this._drawingMouseDownCallback
    );
    element.removeEventListener(
      EVENTS.MOUSE_MOVE,
      this._drawingMouseMoveCallback
    );
    element.removeEventListener(
      EVENTS.MOUSE_DRAG,
      this._drawingMouseDragCallback
    );
    element.removeEventListener(
      EVENTS.MOUSE_UP,
      this._drawingMouseUpCallback
    );

    external.cornerstone.updateImage(element);
  }

  /**
   * Adds modify loop event listeners.
   *
   * @private
   * @param {Object} element - The viewport element to add event listeners to.
   * @modifies {element}
   */
  _activateModify (element) {
    element.addEventListener(EVENTS.MOUSE_UP, this._editMouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_DRAG, this._editMouseDragCallback);
    element.addEventListener(EVENTS.MOUSE_CLICK, this._editMouseUpCallback);

    external.cornerstone.updateImage(element);
  }

  /**
   * Removes modify loop event listeners.
   *
   * @private
   * @param {Object} element - The viewport element to add event listeners to.
   * @modifies {element}
   */
  _deactivateModify (element) {
    element.removeEventListener(EVENTS.MOUSE_UP, this._editMouseUpCallback);
    element.removeEventListener(EVENTS.MOUSE_DRAG, this._editMouseDragCallback);
    element.removeEventListener(EVENTS.MOUSE_CLICK, this._editMouseUpCallback);

    external.cornerstone.updateImage(element);
  }

  passiveCallback (element) {
    this._closeToolIfDrawing(element);
  }

  enabledCallback (element) {
    this._closeToolIfDrawing(element);
  }

  disabledCallback (element) {
    this._closeToolIfDrawing(element);
  }

  _closeToolIfDrawing (element) {
    if (this._drawing) {
      // Actively drawing but changed mode.
      const config = this.configuration;
      const lastHandlePlaced = config.currentHandle;

      this._endDrawing(element, lastHandlePlaced);
      external.cornerstone.updateImage(element);
    }
  }

  // ===================================================================
  // Public Configuration API. .
  // ===================================================================

  get spacing () {
    return this.configuration.spacing;
  }

  set spacing (value) {
    if (typeof value !== 'number') {
      throw new Error(
        'Attempting to set freehand spacing to a value other than a number.'
      );
    }

    this.configuration.spacing = value;
    external.cornerstone.updateImage(this.element);
  }

  get activeHandleRadius () {
    return this.configuration.activeHandleRadius;
  }

  set activeHandleRadius (value) {
    if (typeof value !== 'number') {
      throw new Error(
        'Attempting to set freehand activeHandleRadius to a value other than a number.'
      );
    }

    this.configuration.activeHandleRadius = value;
    external.cornerstone.updateImage(this.element);
  }

  get completeHandleRadius () {
    return this.configuration.completeHandleRadius;
  }

  set completeHandleRadius (value) {
    if (typeof value !== 'number') {
      throw new Error(
        'Attempting to set freehand completeHandleRadius to a value other than a number.'
      );
    }

    this.configuration.completeHandleRadius = value;
    external.cornerstone.updateImage(this.element);
  }

  get alwaysShowHandles () {
    return this.configuration.alwaysShowHandles;
  }

  set alwaysShowHandles (value) {
    if (typeof value !== 'boolean') {
      throw new Error(
        'Attempting to set freehand alwaysShowHandles to a value other than a boolean.'
      );
    }

    this.configuration.alwaysShowHandles = value;
    external.cornerstone.updateImage(this.element);
  }

  get invalidColor () {
    return this.configuration.invalidColor;
  }

  set invalidColor (value) {

    /*
      It'd be easy to check if the color was e.g. a valid rgba color. However
      it'd be difficult to check if the color was a named CSS color without
      bloating the library, so we don't. If the canvas can't intepret the color
      it'll show up grey.
    */

    this.configuration.invalidColor = value;
    external.cornerstone.updateImage(this.element);
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
    spacing: 5,
    activeHandleRadius: 3,
    completeHandleRadius: 6,
    alwaysShowHandles: false,
    invalidColor: 'crimson',
    currentHandle: 0,
    currentTool: -1
  };
}

function preventPropagation (evt) {
  evt.stopImmediatePropagation();
  evt.stopPropagation();
  evt.preventDefault();
}
