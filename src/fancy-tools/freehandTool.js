/* eslint no-loop-func: 0 */ // --> OFF
import external from './../externalModules.js';
import baseAnnotationTool from './../base/baseAnnotationTool.js';
// State
import { getToolState } from './../stateManagement/toolState.js';
import toolStyle from './../stateManagement/toolStyle.js';
import toolColors from './../stateManagement/toolColors.js';
// Manipulators
import drawHandles from './../manipulators/drawHandles.js';

//Implementation Logic
import pointInsideBoundingBox from '../util/pointInsideBoundingBox.js';
import dragObject from '../util/freehand/dragObject.js';
import dropObject from '../util/freehand/dropObject.js';
import insertOrDelete from '../util/freehand/insertOrDelete.js';
import freeHandArea from '../util/freehand/freeHandArea.js';
import calculateFreehandStatistics from '../util/freehand/calculateFreehandStatistics.js';
import freeHandIntersect from '../util/freehand/freeHandIntersect.js';
import { FreehandHandleData } from '../util/freehand/FreehandHandleData.js';
// Drawing
import { getNewContext, draw, setShadow, drawLine } from './../util/drawing.js';
import drawLinkedTextBox from './../util/drawLinkedTextBox.js';

const cornerstone = external.cornerstone;

export default class extends baseAnnotationTool {
  constructor (name) {
    super({
      name: name || 'freehand',
      supportedInteractionTypes: ['mouse'],
      configuration: this.defaultConfiguration
    });
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
        `required eventData not supplieed to tool ${
          this.name
        }'s createNewMeasurement`
      );

      return;
    }

    return measurementData = {
      visible: true,
      active: true,
      invalidated: true,
      color: undefined,
      handles: [],
      textBox: {
        active: false,
        hasMoved: false,
        movesIndependently: false,
        drawnIndependently: true,
        allowedOutsideImage: true,
        hasBoundingBox: true
      }
    };
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
    const hasStartAndEndHandles =
      data && data.handles && data.handles.start && data.handles.end;
    const validParameters = hasStartAndEndHandles;

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

  /**
   *
   *
   * @param {*} evt
   * @returns
   */
  renderToolData (evt) {
    const eventData = evt.detail;

    // If we have no toolData for this element, return immediately as there is nothing to do
    const toolData = getToolState(evt.currentTarget, toolType);

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
            meanStdDev = calculateFreehandStatistics(pixels, polyBoundingBox, data.handles);

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
        if (data.polyBoundingBox && !data.textBox.freehand) {
          // If the textbox has not been moved by the user, it should be displayed on the right-most
          // Side of the tool.
          if (!data.textBox.hasMoved) {
            // Find the rightmost side of the polyBoundingBox at its vertical center, and place the textbox here
            // Note that this calculates it in image coordinates
            data.textBox.x = data.polyBoundingBox.left + data.polyBoundingBox.width;
            data.textBox.y = data.polyBoundingBox.top + data.polyBoundingBox.height / 2;
          }

          const text = textBoxText(data);

          drawLinkedTextBox(context, element, data.textBox, text,
            data.handles, textBoxAnchorPoints, color, lineWidth, 0, true);
        }
      });
    }

    const textBoxText = (data) => {
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
        let meanText = `Mean: ${this._numberWithCommas(meanStdDev.mean.toFixed(2))}${moSuffix}`;
        // Create a line of text to display the standard deviation and any units that were specified (i.e. HU)
        let stdDevText = `StdDev: ${this._numberWithCommas(meanStdDev.stdDev.toFixed(2))}${moSuffix}`;

        // If this image has SUV values to display, concatenate them to the text line
        if (meanStdDevSUV && meanStdDevSUV.mean !== undefined) {
          const SUVtext = ' SUV: ';

          meanText += SUVtext + this._numberWithCommas(meanStdDevSUV.mean.toFixed(2));
          stdDevText += SUVtext + this._numberWithCommas(meanStdDevSUV.stdDev.toFixed(2));
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
        const areaText = `Area: ${this._numberWithCommas(area.toFixed(2))}${suffix}`;

        // Add this text line to the array to be displayed in the textbox
        textLines.push(areaText);
      }

      return textLines;
    }

    const textBoxAnchorPoints = (handles) => {
      return handles;
    }
  }


  /** Returns a handle of a particular tool if it is close to the mouse cursor
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
    if (data.textBox) {
      if (pointInsideBoundingBox(data.textBox, coords)) {
        return data.textBox;
      }
    }

    return null;
  }

  /** Adds commas as thousand seperators to a Number to increase readability.
  *
  * @param {Number|String} number - A Number or String literal representing a number.
  * @return {String} - A string literal representaton of the number with commas seperating the thousands.
  */
  _numberWithCommas (number) {
    // http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
    const parts = number.toString().split('.');

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return parts.join('.');
  }

  get defaultConfiguration() {
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

}
