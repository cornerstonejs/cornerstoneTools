import external from './../../externalModules.js';
import BaseAnnotationTool from '../base/BaseAnnotationTool.js';
// State
import { getToolState } from './../../stateManagement/toolState.js';
import toolStyle from './../../stateManagement/toolStyle.js';
import toolColors from './../../stateManagement/toolColors.js';

// Drawing
import {
  getNewContext,
  draw,
  setShadow,
  drawEllipse,
  drawHandles,
  drawLinkedTextBox,
} from './../../drawing/index.js';

// Util
import calculateSUV from './../../util/calculateSUV.js';
import {
  pointInEllipse,
  calculateEllipseStatistics,
} from './../../util/ellipse/index.js';
import numbersWithCommas from './../../util/numbersWithCommas.js';
import throttle from './../../util/throttle.js';

/**
 * @public
 * @class EllipticalRoiTool
 * @memberof Tools.Annotation
 * @classdesc Tool for drawing elliptical regions of interest, and measuring
 * the statistics of the enclosed pixels.
 * @extends Tools.Base.BaseAnnotationTool
 */
export default class EllipticalRoiTool extends BaseAnnotationTool {
  constructor(configuration = {}) {
    const defaultConfig = {
      name: 'EllipticalRoi',
      supportedInteractionTypes: ['Mouse', 'Touch'],
    };
    const initialConfiguration = Object.assign(defaultConfig, configuration);

    super(initialConfiguration);

    this.initialConfiguration = initialConfiguration;
  }

  createNewMeasurement(eventData) {
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
          active: false,
        },
        end: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: true,
        },
        textBox: {
          active: false,
          hasMoved: false,
          movesIndependently: false,
          drawnIndependently: true,
          allowedOutsideImage: true,
          hasBoundingBox: true,
        },
      },
    };
  }

  /**
   *
   *
   * @param {*} element
   * @param {*} data
   * @param {*} coords
   * @returns {Boolean}
   */
  pointNearTool(element, data, coords) {
    // TODO: How should we handle touch? for mouse, distance is 15 for touch its 25
    const distance = 15;

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

    const startCanvas = external.cornerstone.pixelToCanvas(
      element,
      data.handles.start
    );
    const endCanvas = external.cornerstone.pixelToCanvas(
      element,
      data.handles.end
    );

    const minorEllipse = {
      left: Math.min(startCanvas.x, endCanvas.x) + distance / 2,
      top: Math.min(startCanvas.y, endCanvas.y) + distance / 2,
      width: Math.abs(startCanvas.x - endCanvas.x) - distance,
      height: Math.abs(startCanvas.y - endCanvas.y) - distance,
    };

    const majorEllipse = {
      left: Math.min(startCanvas.x, endCanvas.x) - distance / 2,
      top: Math.min(startCanvas.y, endCanvas.y) - distance / 2,
      width: Math.abs(startCanvas.x - endCanvas.x) + distance,
      height: Math.abs(startCanvas.y - endCanvas.y) + distance,
    };

    const pointInMinorEllipse = pointInEllipse(minorEllipse, coords);
    const pointInMajorEllipse = pointInEllipse(majorEllipse, coords);

    if (pointInMajorEllipse && !pointInMinorEllipse) {
      return true;
    }

    return false;
  }

  renderToolData(evt) {
    const toolData = getToolState(evt.currentTarget, this.name);

    if (!toolData) {
      return;
    }

    const eventData = evt.detail;
    const { image, element } = eventData;
    const lineWidth = toolStyle.getToolWidth();
    const { handleRadius, drawHandlesOnHover } = this.configuration;
    const context = getNewContext(eventData.canvasContext.canvas);

    // Meta
    const seriesModule = external.cornerstone.metaData.get(
      'generalSeriesModule',
      image.imageId
    );
    let imagePlane = external.cornerstone.metaData.get(
      'imagePlaneModule',
      image.imageId
    );

    // Pixel Spacing
    const modality = seriesModule.modality;
    const hasPixelSpacing =
      imagePlane && imagePlane.rowPixelSpacing && imagePlane.columnPixelSpacing;
    imagePlane = imagePlane || {};

    const pixelSpacing = {
      rowPixelSpacing: imagePlane.rowPixelSpacing || 1,
      columnPixelSpacing: imagePlane.columnPixelSpacing || 1,
    };

    draw(context, context => {
      // If we have tool data for this element - iterate over each set and draw it
      for (let i = 0; i < toolData.data.length; i++) {
        const data = toolData.data[i];

        if (data.visible === false) {
          continue;
        }

        // Configure
        const color = toolColors.getColorIfActive(data);
        const handleOptions = {
          color,
          handleRadius,
          drawHandlesIfActive: drawHandlesOnHover,
        };

        setShadow(context, this.configuration);

        // Draw
        drawEllipse(context, element, data.handles.start, data.handles.end, {
          color,
        });
        drawHandles(context, eventData, data.handles, handleOptions);

        // Update textbox stats
        if (data.invalidated === true) {
          if (data.cachedStats) {
            _throttledUpdateCachedStats(
              image,
              element,
              data,
              modality,
              pixelSpacing
            );
          } else {
            _updateCachedStats(image, element, data, modality, pixelSpacing);
          }
        }

        // If the data has been invalidated, we need to calculate it again

        // Set the invalidated flag to false so that this data won't automatically be recalculated
        data.invalidated = false;

        // If the textbox has not been moved by the user, it should be displayed
        // on the right-most side of the tool.
        if (!data.handles.textBox.hasMoved) {
          // Find the rightmost side of the ellipse at its vertical center, and place the textbox here
          // Note that this calculates it in image coordinates
          data.handles.textBox.x = Math.max(
            data.handles.start.x,
            data.handles.end.x
          );
          data.handles.textBox.y =
            (data.handles.start.y + data.handles.end.y) / 2;
        }

        const text = _createTextBoxContent(
          data.cachedStats,
          modality,
          hasPixelSpacing
        );

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

    function textBoxAnchorPoints(handles) {
      // Retrieve the bounds of the ellipse (left, top, width, and height)
      const left = Math.min(handles.start.x, handles.end.x);
      const top = Math.min(handles.start.y, handles.end.y);
      const width = Math.abs(handles.start.x - handles.end.x);
      const height = Math.abs(handles.start.y - handles.end.y);

      return [
        {
          // Top middle point of ellipse
          x: left + width / 2,
          y: top,
        },
        {
          // Left middle point of ellipse
          x: left,
          y: top + height / 2,
        },
        {
          // Bottom middle point of ellipse
          x: left + width / 2,
          y: top + height,
        },
        {
          // Right middle point of ellipse
          x: left + width,
          y: top + height / 2,
        },
      ];
    }
  }
}

/**
 *
 */
const _throttledUpdateCachedStats = throttle(_updateCachedStats, 110);

/**
 *
 *
 * @param {*} image
 * @param {*} element
 * @param {*} data
 * @param {string} modality
 * @param {*} pixelSpacing
 */
function _updateCachedStats(image, element, data, modality, pixelSpacing) {
  const stats = _calculateStats(
    image,
    element,
    data.handles,
    modality,
    pixelSpacing
  );
  data.cachedStats = stats;
}

function _createTextBoxContent(
  { area, mean, stdDev, min, max, meanStdDevSUV } = {},
  modality,
  hasPixelSpacing
) {
  // Define an array to store the rows of text for the textbox
  const textLines = [];

  // Don't display mean/standardDev for color images
  const isColor = image.color;
  if (!isColor) {
    // If the modality is CT, add HU to denote Hounsfield Units
    const suffix = modality === 'CT' ? ' HU' : '';
    let meanString = `Mean: ${numbersWithCommas(mean.toFixed(2))}${suffix}`;
    let stdDevString = `StdDev: ${numbersWithCommas(
      stdDev.toFixed(2)
    )}${suffix}`;

    // If this image has SUV values to display, concatenate them to the text line
    if (meanStdDevSUV && meanStdDevSUV.mean !== 0) {
      const SUVtext = ' SUV: ';

      meanString += SUVtext + numbersWithCommas(meanStdDevSUV.mean.toFixed(2));
      stdDevString +=
        SUVtext + numbersWithCommas(meanStdDevSUV.stdDev.toFixed(2));
    }

    textLines.push(meanString);
    textLines.push(stdDevString);
  }

  // This uses Char code 178 for a superscript 2
  let suffix = hasPixelSpacing
    ? ` mm${String.fromCharCode(178)}`
    : ` pixels${String.fromCharCode(178)}`;

  textLines.push(`Area: ${numbersWithCommas(area.toFixed(2))}${suffix}`);

  return textLines;
}

/**
 *
 *
 * @param {*} image
 * @param {*} element
 * @param {*} handles
 * @param {*} modality
 * @param {*} pixelSpacing
 * @returns
 */
function _calculateStats(image, element, handles, modality, pixelSpacing) {
  // Retrieve the bounds of the ellipse in image coordinates
  const ellipseCoordinates = _getEllipseImageCoordinates(
    handles.start,
    handles.end
  );

  // Retrieve the array of pixels that the ellipse bounds cover
  const pixels = external.cornerstone.getPixels(
    element,
    ellipseCoordinates.left,
    ellipseCoordinates.top,
    ellipseCoordinates.width,
    ellipseCoordinates.height
  );

  // Calculate the mean & standard deviation from the pixels and the ellipse details
  const ellipseMeanStdDev = calculateEllipseStatistics(
    pixels,
    ellipseCoordinates
  );

  let meanStdDevSUV = {
    mean: undefined,
    stdDev: undefined,
  };
  if (modality === 'PT') {
    meanStdDevSUV = {
      mean: calculateSUV(image, ellipseMeanStdDev.mean, true) || 0,
      stdDev: calculateSUV(image, ellipseMeanStdDev.stdDev, true) || 0,
    };
  }

  // Calculate the image area from the ellipse dimensions and pixel spacing
  const area =
    Math.PI *
    ((ellipse.width * (pixelSpacing.columnPixelSpacing || 1)) / 2) *
    ((ellipse.height * (pixelSpacing.rowPixelSpacing || 1)) / 2);

  return {
    radius: radius || 0,
    area: area || 0,
    count: ellipseMeanStdDev.count || 0,
    mean: ellipseMeanStdDev.mean || 0,
    variance: ellipseMeanStdDev.variance || 0,
    stdDev: ellipseMeanStdDev.stdDev || 0,
    min: ellipseMeanStdDev.min || 0,
    max: ellipseMeanStdDev.max || 0,
    meanStdDevSUV,
  };
}

/**
 * Retrieve the bounds of the ellipse in image coordinates
 *
 * @param {*} startHandle
 * @param {*} endHandle
 * @returns
 */
function _getEllipseImageCoordinates(startHandle, endHandle) {
  return {
    left: Math.round(Math.min(startHandle.x, endHandle.x)),
    top: Math.round(Math.min(startHandle.y, endHandle.y)),
    width: Math.round(Math.abs(startHandle.x - endHandle.x)),
    height: Math.round(Math.abs(startHandle.y - endHandle.y)),
  };
}
