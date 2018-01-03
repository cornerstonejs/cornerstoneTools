import external from '../externalModules.js';
import mouseButtonTool from './mouseButtonTool.js';
import touchTool from './touchTool.js';
import toolStyle from '../stateManagement/toolStyle.js';
import toolColors from '../stateManagement/toolColors.js';
import drawHandles from '../manipulators/drawHandles.js';
import drawTextBox from '../util/drawTextBox.js';
import drawEllipse from '../util/drawEllipse.js';
import pointInEllipse from '../util/pointInEllipse.js';
import calculateEllipseStatistics from '../util/calculateEllipseStatistics.js';
import calculateSUV from '../util/calculateSUV.js';
import { getToolState } from '../stateManagement/toolState.js';

const toolType = 'ellipticalRoi';

// /////// BEGIN ACTIVE TOOL ///////
function createNewMeasurement (mouseEventData) {
  // Create the measurement data for this tool with the end handle activated
  const measurementData = {
    visible: true,
    active: true,
    invalidated: true,
    handles: {
      start: {
        x: mouseEventData.currentPoints.image.x,
        y: mouseEventData.currentPoints.image.y,
        highlight: true,
        active: false
      },
      end: {
        x: mouseEventData.currentPoints.image.x,
        y: mouseEventData.currentPoints.image.y,
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

  return measurementData;
}
// /////// END ACTIVE TOOL ///////

// /////// BEGIN IMAGE RENDERING ///////
function pointNearEllipse (element, data, coords, distance) {
  const cornerstone = external.cornerstone;
  const startCanvas = cornerstone.pixelToCanvas(element, data.handles.start);
  const endCanvas = cornerstone.pixelToCanvas(element, data.handles.end);

  const minorEllipse = {
    left: Math.min(startCanvas.x, endCanvas.x) + distance / 2,
    top: Math.min(startCanvas.y, endCanvas.y) + distance / 2,
    width: Math.abs(startCanvas.x - endCanvas.x) - distance,
    height: Math.abs(startCanvas.y - endCanvas.y) - distance
  };

  const majorEllipse = {
    left: Math.min(startCanvas.x, endCanvas.x) - distance / 2,
    top: Math.min(startCanvas.y, endCanvas.y) - distance / 2,
    width: Math.abs(startCanvas.x - endCanvas.x) + distance,
    height: Math.abs(startCanvas.y - endCanvas.y) + distance
  };

  const pointInMinorEllipse = pointInEllipse(minorEllipse, coords);
  const pointInMajorEllipse = pointInEllipse(majorEllipse, coords);

  if (pointInMajorEllipse && !pointInMinorEllipse) {
    return true;
  }

  return false;
}

function pointNearTool (element, data, coords) {
  return pointNearEllipse(element, data, coords, 15);
}

function pointNearToolTouch (element, data, coords) {
  return pointNearEllipse(element, data, coords, 25);
}

function numberWithCommas (x) {
  // http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
  const parts = x.toString().split('.');

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
}

function onImageRendered (e) {
  const eventData = e.detail;

  // If we have no toolData for this element, return immediately as there is nothing to do
  const toolData = getToolState(e.currentTarget, toolType);

  if (!toolData) {
    return;
  }

  const cornerstone = external.cornerstone;
  const image = eventData.image;
  const element = eventData.element;
  const lineWidth = toolStyle.getToolWidth();
  const config = ellipticalRoi.getConfiguration();
  const context = eventData.canvasContext.canvas.getContext('2d');
  const seriesModule = cornerstone.metaData.get('generalSeriesModule', image.imageId);
  let modality;

  if (seriesModule) {
    modality = seriesModule.modality;
  }

  context.setTransform(1, 0, 0, 1, 0, 0);

  // If we have tool data for this element - iterate over each set and draw it
  for (let i = 0; i < toolData.data.length; i++) {
    context.save();

    const data = toolData.data[i];

    // Apply any shadow settings defined in the tool configuration
    if (config && config.shadow) {
      context.shadowColor = config.shadowColor || '#000000';
      context.shadowOffsetX = config.shadowOffsetX || 1;
      context.shadowOffsetY = config.shadowOffsetY || 1;
    }

    // Check which color the rendered tool should be
    const color = toolColors.getColorIfActive(data.active);

    // Convert Image coordinates to Canvas coordinates given the element
    const handleStartCanvas = cornerstone.pixelToCanvas(element, data.handles.start);
    const handleEndCanvas = cornerstone.pixelToCanvas(element, data.handles.end);

    // Retrieve the bounds of the ellipse (left, top, width, and height)
    // In Canvas coordinates
    const leftCanvas = Math.min(handleStartCanvas.x, handleEndCanvas.x);
    const topCanvas = Math.min(handleStartCanvas.y, handleEndCanvas.y);
    const widthCanvas = Math.abs(handleStartCanvas.x - handleEndCanvas.x);
    const heightCanvas = Math.abs(handleStartCanvas.y - handleEndCanvas.y);

    // Draw the ellipse on the canvas
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    drawEllipse(context, leftCanvas, topCanvas, widthCanvas, heightCanvas);
    context.closePath();

    // If the tool configuration specifies to only draw the handles on hover / active,
    // Follow this logic
    if (config && config.drawHandlesOnHover) {
      // Draw the handles if the tool is active
      if (data.active === true) {
        drawHandles(context, eventData, data.handles, color);
      } else {
        // If the tool is inactive, draw the handles only if each specific handle is being
        // Hovered over
        const handleOptions = {
          drawHandlesIfActive: true
        };

        drawHandles(context, eventData, data.handles, color, handleOptions);
      }
    } else {
      // If the tool has no configuration settings, always draw the handles
      drawHandles(context, eventData, data.handles, color);
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
    } else {
      // If the data has been invalidated, we need to calculate it again

      // Retrieve the bounds of the ellipse in image coordinates
      const ellipse = {
        left: Math.round(Math.min(data.handles.start.x, data.handles.end.x)),
        top: Math.round(Math.min(data.handles.start.y, data.handles.end.y)),
        width: Math.round(Math.abs(data.handles.start.x - data.handles.end.x)),
        height: Math.round(Math.abs(data.handles.start.y - data.handles.end.y))
      };

      // First, make sure this is not a color image, since no mean / standard
      // Deviation will be calculated for color images.
      if (!image.color) {
        // Retrieve the array of pixels that the ellipse bounds cover
        const pixels = cornerstone.getPixels(element, ellipse.left, ellipse.top, ellipse.width, ellipse.height);

        // Calculate the mean & standard deviation from the pixels and the ellipse details
        meanStdDev = calculateEllipseStatistics(pixels, ellipse);

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

      // Calculate the image area from the ellipse dimensions and pixel spacing
      area = Math.PI * (ellipse.width * columnPixelSpacing / 2) * (ellipse.height * rowPixelSpacing / 2);

      // If the area value is sane, store it for later retrieval
      if (!isNaN(area)) {
        data.area = area;
      }

      // Set the invalidated flag to false so that this data won't automatically be recalculated
      data.invalidated = false;
    }

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
      let meanText = `Mean: ${numberWithCommas(meanStdDev.mean.toFixed(2))}${moSuffix}`;
      // Create a line of text to display the standard deviation and any units that were specified (i.e. HU)
      let stdDevText = `StdDev: ${numberWithCommas(meanStdDev.stdDev.toFixed(2))}${moSuffix}`;

      // If this image has SUV values to display, concatenate them to the text line
      if (meanStdDevSUV && meanStdDevSUV.mean !== undefined) {
        const SUVtext = ' SUV: ';

        meanText += SUVtext + numberWithCommas(meanStdDevSUV.mean.toFixed(2));
        stdDevText += SUVtext + numberWithCommas(meanStdDevSUV.stdDev.toFixed(2));
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
      const areaText = `Area: ${numberWithCommas(area.toFixed(2))}${suffix}`;

      // Add this text line to the array to be displayed in the textbox
      textLines.push(areaText);
    }

    // If the textbox has not been moved by the user, it should be displayed on the right-most
    // Side of the tool.
    if (!data.handles.textBox.hasMoved) {
      // Find the rightmost side of the ellipse at its vertical center, and place the textbox here
      // Note that this calculates it in image coordinates
      data.handles.textBox.x = Math.max(data.handles.start.x, data.handles.end.x);
      data.handles.textBox.y = (data.handles.start.y + data.handles.end.y) / 2;
    }

    // Convert the textbox Image coordinates into Canvas coordinates
    const textCoords = cornerstone.pixelToCanvas(element, data.handles.textBox);

    // Set options for the textbox drawing function
    const options = {
      centering: {
        x: false,
        y: true
      }
    };

    // Draw the textbox and retrieves it's bounding box for mouse-dragging and highlighting
    const boundingBox = drawTextBox(context, textLines, textCoords.x,
      textCoords.y, color, options);

    // Store the bounding box data in the handle for mouse-dragging and highlighting
    data.handles.textBox.boundingBox = boundingBox;

    // If the textbox has moved, we would like to draw a line linking it with the tool
    // This section decides where to draw this line to on the Ellipse based on the location
    // Of the textbox relative to the ellipse.
    if (data.handles.textBox.hasMoved) {
      // Draw dashed link line between tool and text

      // The initial link position is at the center of the
      // Textbox.
      const link = {
        start: {},
        end: {
          x: textCoords.x,
          y: textCoords.y
        }
      };

      // First we calculate the ellipse points (top, left, right, and bottom)
      const ellipsePoints = [{
        // Top middle point of ellipse
        x: leftCanvas + widthCanvas / 2,
        y: topCanvas
      }, {
        // Left middle point of ellipse
        x: leftCanvas,
        y: topCanvas + heightCanvas / 2
      }, {
        // Bottom middle point of ellipse
        x: leftCanvas + widthCanvas / 2,
        y: topCanvas + heightCanvas
      }, {
        // Right middle point of ellipse
        x: leftCanvas + widthCanvas,
        y: topCanvas + heightCanvas / 2
      }];

      // We obtain the link starting point by finding the closest point on the ellipse to the
      // Center of the textbox
      link.start = external.cornerstoneMath.point.findClosestPoint(ellipsePoints, link.end);

      // Next we calculate the corners of the textbox bounding box
      const boundingBoxPoints = [{
        // Top middle point of bounding box
        x: boundingBox.left + boundingBox.width / 2,
        y: boundingBox.top
      }, {
        // Left middle point of bounding box
        x: boundingBox.left,
        y: boundingBox.top + boundingBox.height / 2
      }, {
        // Bottom middle point of bounding box
        x: boundingBox.left + boundingBox.width / 2,
        y: boundingBox.top + boundingBox.height
      }, {
        // Right middle point of bounding box
        x: boundingBox.left + boundingBox.width,
        y: boundingBox.top + boundingBox.height / 2
      }];

      // Now we recalculate the link endpoint by identifying which corner of the bounding box
      // Is closest to the start point we just calculated.
      link.end = external.cornerstoneMath.point.findClosestPoint(boundingBoxPoints, link.start);

      // Finally we draw the dashed linking line
      context.beginPath();
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.setLineDash([2, 3]);
      context.moveTo(link.start.x, link.start.y);
      context.lineTo(link.end.x, link.end.y);
      context.stroke();
    }

    context.restore();
  }
}
// /////// END IMAGE RENDERING ///////

// Module exports
const ellipticalRoi = mouseButtonTool({
  createNewMeasurement,
  onImageRendered,
  pointNearTool,
  toolType
});

const ellipticalRoiTouch = touchTool({
  createNewMeasurement,
  onImageRendered,
  pointNearTool: pointNearToolTouch,
  toolType
});

export { ellipticalRoi, ellipticalRoiTouch };
