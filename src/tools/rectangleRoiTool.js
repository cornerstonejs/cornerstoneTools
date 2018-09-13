/* eslint no-loop-func: 0 */ // --> OFF
import external from '../externalModules.js';
import BaseAnnotationTool from '../base/BaseAnnotationTool.js';
// State
import { getToolState } from '../stateManagement/toolState.js';
import toolStyle from '../stateManagement/toolStyle.js';
import toolColors from '../stateManagement/toolColors.js';
// Manipulators
import drawHandles from '../manipulators/drawHandles.js';
// Drawing
import { getNewContext, draw, setShadow, drawRect } from '../util/drawing.js';
import drawLinkedTextBox from '../util/drawLinkedTextBox.js';
import calculateSUV from '../util/calculateSUV.js';
//
import numberWithCommas from './shared/numbersWithCommas.js';

export default class RectangleRoiTool extends BaseAnnotationTool {
  constructor (name = 'RectangleRoi') {
    super({
      name,
      supportedInteractionTypes: ['mouse', 'touch']
    });
  }

  /**
   * Create the measurement data for this tool with the end handle activated
   *
   * @param {*} eventData
   * @returns
   */
  createNewMeasurement (eventData) {
    const goodEventData =
      eventData && eventData.currentPoints && eventData.currentPoints.image;

    if (!goodEventData) {
      console.error(
        `required eventData not supplied to tool ${this.name}'s createNewMeasurement`
      );

      return;
    }

    return {
      visible: true,
      active: true,
      color: undefined,
      invalidated: true,
      handles: {
        start: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: false
        },
        end: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: true
        },
        textBox: {
          active: false,
          hasMoved: false,
          movesIndependently: false,
          drawnIndependently: true,
          allowedOutsideImage: true,
          hasBoundingBox: true
        }
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

    const startCanvas = external.cornerstone.pixelToCanvas(element, data.handles.start);
    const endCanvas = external.cornerstone.pixelToCanvas(element, data.handles.end);

    const rect = {
      left: Math.min(startCanvas.x, endCanvas.x),
      top: Math.min(startCanvas.y, endCanvas.y),
      width: Math.abs(startCanvas.x - endCanvas.x),
      height: Math.abs(startCanvas.y - endCanvas.y)
    };

    const distanceToPoint = external.cornerstoneMath.rect.distanceToPoint(
      rect,
      coords
    );

    return distanceToPoint < 5;
  }

  /**
   *
   *
   * @param {*} evt
   * @returns
   */
  renderToolData (evt) {
    const eventData = evt.detail;
    const toolData = getToolState(evt.currentTarget, this.name);

    if (!toolData) {
      return;
    }

    // We have tool data for this element - iterate over each one and draw it
    const context = getNewContext(eventData.canvasContext.canvas);
    const { image, element } = eventData;

    const lineWidth = toolStyle.getToolWidth();
    const config = this.configuration;
    const seriesModule = external.cornerstone.metaData.get(
      'generalSeriesModule',
      image.imageId
    );
    const imagePlane = external.cornerstone.metaData.get(
      'imagePlaneModule',
      image.imageId
    );

    let modality;
    let rowPixelSpacing = image.rowPixelSpacing;
    let colPixelSpacing = image.columnPixelSpacing;

    if (imagePlane) {
      rowPixelSpacing =
        imagePlane.rowPixelSpacing || imagePlane.rowImagePixelSpacing;
      colPixelSpacing =
        imagePlane.columnPixelSpacing || imagePlane.colImagePixelSpacing;
    }

    if (seriesModule) {
      modality = seriesModule.modality;
    }

    // If we have tool data for this element - iterate over each set and draw it
    for (let i = 0; i < toolData.data.length; i++) {
      const data = toolData.data[i];

      if (data.visible === false) {
        continue;
      }

      draw(context, (context) => {
        // Apply any shadow settings defined in the tool configuration
        setShadow(context, config);

        // Check which color the rendered tool should be
        const color = toolColors.getColorIfActive(data);

        // Draw the rectangle on the canvas
        drawRect(context, element, data.handles.start, data.handles.end, { color });

        // Draw the handles
        const handleOptions = {
          drawHandlesIfActive: config && config.drawHandlesOnHover
        };

        drawHandles(context, eventData, data.handles, color, handleOptions);

        // Define variables for the area and mean/standard deviation
        let area, meanStdDev, meanStdDevSUV;

        // Perform a check to see if the tool has been invalidated. This is to prevent
        // Unnecessary re-calculation of the area, mean, and standard deviation if the
        // Image is re-rendered but the tool has not moved (e.g. during a zoom)
        if (data.invalidated === false) {
          // If the data is not invalidated, retrieve it from the toolData
          meanStdDev = data.meanStdDev;
          meanStdDevSUV = data.meanStdDevSUV;
          area = data.area;
        } else {
          // If the data has been invalidated, we need to calculate it again

          // Retrieve the bounds of the rectangle in image coordinates
          const rectangle = {
            left: Math.min(data.handles.start.x, data.handles.end.x),
            top: Math.min(data.handles.start.y, data.handles.end.y),
            width: Math.abs(data.handles.start.x - data.handles.end.x),
            height: Math.abs(data.handles.start.y - data.handles.end.y)
          };

          // First, make sure this is not a color image, since no mean / standard
          // Deviation will be calculated for color images.
          if (!image.color) {
            // Retrieve the array of pixels that the rectangle bounds cover
            const pixels = external.cornerstone.getPixels(
              element,
              rectangle.left,
              rectangle.top,
              rectangle.width,
              rectangle.height
            );

            // Calculate the mean & standard deviation from the pixels and the rectangle details
            meanStdDev = calculateMeanStdDev(pixels, rectangle);

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

          // Calculate the image area from the rectangle dimensions and pixel spacing
          area =
            rectangle.width *
            (colPixelSpacing || 1) *
            (rectangle.height * (rowPixelSpacing || 1));

          // If the area value is sane, store it for later retrieval
          if (!isNaN(area)) {
            data.area = area;
          }

          // Set the invalidated flag to false so that this data won't automatically be recalculated
          data.invalidated = false;
        }

        const text = textBoxText(data);

        // If the textbox has not been moved by the user, it should be displayed on the right-most
        // Side of the tool.
        if (!data.handles.textBox.hasMoved) {
          // Find the rightmost side of the rectangle at its vertical center, and place the textbox here
          // Note that this calculates it in image coordinates
          data.handles.textBox.x = Math.max(
            data.handles.start.x,
            data.handles.end.x
          );
          data.handles.textBox.y =
            (data.handles.start.y + data.handles.end.y) / 2;
        }

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
        let meanText = `Mean: ${numberWithCommas(
          meanStdDev.mean.toFixed(2)
        )}${moSuffix}`;
        // Create a line of text to display the standard deviation and any units that were specified (i.e. HU)
        let stdDevText = `StdDev: ${numberWithCommas(
          meanStdDev.stdDev.toFixed(2)
        )}${moSuffix}`;

        // If this image has SUV values to display, concatenate them to the text line
        if (meanStdDevSUV && meanStdDevSUV.mean !== undefined) {
          const SUVtext = ' SUV: ';

          meanText += SUVtext + numberWithCommas(meanStdDevSUV.mean.toFixed(2));
          stdDevText +=
            SUVtext + numberWithCommas(meanStdDevSUV.stdDev.toFixed(2));
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

        if (!rowPixelSpacing || !colPixelSpacing) {
          suffix = ` pixels${String.fromCharCode(178)}`;
        }

        // Create a line of text to display the area and its units
        const areaText = `Area: ${numberWithCommas(area.toFixed(2))}${suffix}`;

        // Add this text line to the array to be displayed in the textbox
        textLines.push(areaText);
      }

      return textLines;
    }

    function textBoxAnchorPoints (handles) {
      // Retrieve the bounds of the rectangle (left, top, width, and height)
      const left = Math.min(handles.start.x, handles.end.x);
      const top = Math.min(handles.start.y, handles.end.y);
      const width = Math.abs(handles.start.x - handles.end.x);
      const height = Math.abs(handles.start.y - handles.end.y);

      return [
        {
          // Top middle point of rectangle
          x: left + width / 2,
          y: top
        },
        {
          // Left middle point of rectangle
          x: left,
          y: top + height / 2
        },
        {
          // Bottom middle point of rectangle
          x: left + width / 2,
          y: top + height
        },
        {
          // Right middle point of rectangle
          x: left + width,
          y: top + height / 2
        }
      ];
    }
  }
}

const calculateMeanStdDev = (sp, rectangle) => {
  // TODO: Get a real statistics library here that supports large counts

  let sum = 0;
  let sumSquared = 0;
  let count = 0;
  let index = 0;

  for (let y = rectangle.top; y < rectangle.top + rectangle.height; y++) {
    for (let x = rectangle.left; x < rectangle.left + rectangle.width; x++) {
      sum += sp[index];
      sumSquared += sp[index] * sp[index];
      count++;
      index++;
    }
  }

  if (count === 0) {
    return {
      count,
      mean: 0.0,
      variance: 0.0,
      stdDev: 0.0
    };
  }

  const mean = sum / count;
  const variance = sumSquared / count - mean * mean;

  return {
    count,
    mean,
    variance,
    stdDev: Math.sqrt(variance)
  };
};
