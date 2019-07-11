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
  drawCircle,
  drawHandles,
  drawLinkedTextBox,
} from './../../drawing/index.js';

// Util
import calculateSUV from './../../util/calculateSUV.js';
import { calculateEllipseStatistics } from './../../util/ellipse/index.js';
import getROITextBoxCoords from '../../util/getROITextBoxCoords.js';
import numbersWithCommas from './../../util/numbersWithCommas.js';
import throttle from './../../util/throttle.js';
import { getLogger } from '../../util/logger.js';
import getPixelSpacing from '../../util/getPixelSpacing';
import { circleRoiCursor } from '../cursors/index.js';

const logger = getLogger('tools:annotation:CircleRoiTool');

/**
 * @public
 * @class CircleRoiTool
 * @memberof Tools.Annotation
 * @classdesc Tool for drawing circular regions of interest, and measuring
 * the statistics of the enclosed pixels.
 * @extends Tools.Base.BaseAnnotationTool
 */
export default class CircleRoiTool extends BaseAnnotationTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'CircleRoi',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: circleRoiCursor,
    };

    super(props, defaultProps);

    this.throttledUpdateCachedStats = throttle(this.updateCachedStats, 110);
  }

  createNewMeasurement(eventData) {
    const goodEventData =
      eventData && eventData.currentPoints && eventData.currentPoints.image;

    if (!goodEventData) {
      logger.error(
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
        initialRotation: eventData.viewport.rotation,
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

  pointNearTool(element, data, coords, interactionType) {
    const hasStartAndEndHandles =
      data && data.handles && data.handles.start && data.handles.end;

    if (!hasStartAndEndHandles) {
      logger.warn(
        `invalid parameters supplied to tool ${this.name}'s pointNearTool`
      );
    }

    if (!hasStartAndEndHandles || data.visible === false) {
      return false;
    }

    const distance = interactionType === 'mouse' ? 15 : 25;

    const startCanvas = external.cornerstone.pixelToCanvas(
      element,
      data.handles.start
    );

    const endCanvas = external.cornerstone.pixelToCanvas(
      element,
      data.handles.end
    );

    // StartCanvas is the center of the circle
    const distanceFromCenter = _getDistance(startCanvas, coords);

    // Getting radius of circle annotation in canvas
    const radius = _getDistance(startCanvas, endCanvas);

    // Checking if point is near the tool by comparing its distance from the center of the circle
    return (
      distanceFromCenter > radius - distance / 2 &&
      distanceFromCenter < radius + distance / 2
    );
  }

  updateCachedStats(image, element, data) {
    const seriesModule =
      external.cornerstone.metaData.get('generalSeriesModule', image.imageId) ||
      {};
    const modality = seriesModule.modality;
    const pixelSpacing = getPixelSpacing(image);

    const stats = _calculateStats(
      image,
      element,
      data.handles,
      modality,
      pixelSpacing
    );

    data.cachedStats = stats;
    data.invalidated = false;
  }

  renderToolData(evt) {
    const toolData = getToolState(evt.currentTarget, this.name);

    if (!toolData) {
      return;
    }

    const eventData = evt.detail;
    const { image, element, canvasContext } = eventData;
    const lineWidth = toolStyle.getToolWidth();
    const { handleRadius, drawHandlesOnHover } = this.configuration;
    const newContext = getNewContext(canvasContext.canvas);
    const { rowPixelSpacing, colPixelSpacing } = getPixelSpacing(image);

    // Meta
    const seriesModule =
      external.cornerstone.metaData.get('generalSeriesModule', image.imageId) ||
      {};

    // Pixel Spacing
    const modality = seriesModule.modality;
    const hasPixelSpacing = rowPixelSpacing && colPixelSpacing;

    draw(newContext, context => {
      // If we have tool data for this element, iterate over each set and draw it
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

        const startCanvas = external.cornerstone.pixelToCanvas(
          element,
          data.handles.start
        );

        const endCanvas = external.cornerstone.pixelToCanvas(
          element,
          data.handles.end
        );

        // Calculating the radius where startCanvas is the center of the circle to be drawn
        const radius = _getDistance(startCanvas, endCanvas);

        // Draw Circle
        drawCircle(
          context,
          element,
          data.handles.start,
          radius,
          {
            color,
          },
          'pixel'
        );

        drawHandles(context, eventData, data.handles, handleOptions);

        // Update textbox stats
        if (data.invalidated === true) {
          if (data.cachedStats) {
            this.throttledUpdateCachedStats(image, element, data);
          } else {
            this.updateCachedStats(image, element, data);
          }
        }

        // Default to textbox on right side of ROI
        if (!data.handles.textBox.hasMoved) {
          const defaultCoords = getROITextBoxCoords(
            eventData.viewport,
            data.handles
          );

          Object.assign(data.handles.textBox, defaultCoords);
        }

        const textBoxAnchorPoints = handles =>
          _findTextBoxAnchorPoints(handles.start, handles.end);

        const textBoxContent = _createTextBoxContent(
          context,
          image.color,
          data.cachedStats,
          modality,
          hasPixelSpacing,
          this.configuration
        );

        drawLinkedTextBox(
          context,
          element,
          data.handles.textBox,
          textBoxContent,
          data.handles,
          textBoxAnchorPoints,
          color,
          lineWidth,
          10,
          true
        );
      }
    });
  }
}

/**
 *
 *
 * @param {*} startHandle
 * @param {*} endHandle
 * @returns {Array.<{x: number, y: number}>}
 */
function _findTextBoxAnchorPoints(startHandle, endHandle) {
  const { left, top, width, height } = _getCirlceImageCoodinates(
    startHandle,
    endHandle
  );

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

/**
 *
 *
 * @param {*} context
 * @param {*} isColorImage
 * @param {*} { area, mean, stdDev, min, max, meanStdDevSUV }
 * @param {*} modality
 * @param {*} hasPixelSpacing
 * @param {*} [options={}] - { showMinMax, showHounsfieldUnits }
 * @returns {string[]}
 */
function _createTextBoxContent(
  context,
  isColorImage,
  { area, mean, stdDev, min, max, meanStdDevSUV } = {},
  modality,
  hasPixelSpacing,
  options = {}
) {
  const showMinMax = options.showMinMax || false;
  const showHounsfieldUnits = options.showHounsfieldUnits !== false;
  const textLines = [];

  // Don't display mean/standardDev for color images
  const otherLines = [];

  if (!isColorImage) {
    const hasStandardUptakeValues = meanStdDevSUV && meanStdDevSUV.mean !== 0;
    const suffix = modality === 'CT' && showHounsfieldUnits ? ' HU' : '';

    let meanString = `Mean: ${numbersWithCommas(mean.toFixed(2))}${suffix}`;
    const stdDevString = `Std Dev: ${numbersWithCommas(
      stdDev.toFixed(2)
    )}${suffix}`;

    // If this image has SUV values to display, concatenate them to the text line
    if (hasStandardUptakeValues) {
      const SUVtext = ' SUV: ';

      const meanSuvString = `${SUVtext}${numbersWithCommas(
        meanStdDevSUV.mean.toFixed(2)
      )}`;
      const stdDevSuvString = `${SUVtext}${numbersWithCommas(
        meanStdDevSUV.stdDev.toFixed(2)
      )}`;

      const targetStringLength = Math.floor(
        context.measureText(`${stdDevString}     `).width
      );

      while (context.measureText(meanString).width < targetStringLength) {
        meanString += ' ';
      }

      otherLines.push(`${meanString}${meanSuvString}`);
      otherLines.push(`${stdDevString}     ${stdDevSuvString}`);
    } else {
      otherLines.push(`${meanString}     ${stdDevString}`);
    }

    if (showMinMax) {
      let minString = `Min: ${min}${suffix}`;
      const maxString = `Max: ${max}${suffix}`;
      const targetStringLength = hasStandardUptakeValues
        ? Math.floor(context.measureText(`${stdDevString}     `).width)
        : Math.floor(context.measureText(`${meanString}     `).width);

      while (context.measureText(minString).width < targetStringLength) {
        minString += ' ';
      }

      otherLines.push(`${minString}${maxString}`);
    }
  }

  textLines.push(_formatArea(area, hasPixelSpacing));
  otherLines.forEach(x => textLines.push(x));

  return textLines;
}

/**
 *
 *
 * @param {*} area
 * @param {*} hasPixelSpacing
 * @returns {string} The formatted label for showing area
 */
function _formatArea(area, hasPixelSpacing) {
  // This uses Char code 178 for a superscript 2
  const suffix = hasPixelSpacing
    ? ` mm${String.fromCharCode(178)}`
    : ` px${String.fromCharCode(178)}`;

  return `Area: ${numbersWithCommas(area.toFixed(2))}${suffix}`;
}

/**
 *
 *
 * @param {*} image
 * @param {*} element
 * @param {*} handles
 * @param {*} modality
 * @param {*} pixelSpacing
 * @returns {Object} The Stats object
 */
function _calculateStats(image, element, handles, modality, pixelSpacing) {
  // Retrieve the bounds of the ellipse in image coordinates
  const circleCoordinates = _getCirlceImageCoodinates(
    handles.start,
    handles.end
  );

  // Retrieve the array of pixels that the ellipse bounds cover
  const pixels = external.cornerstone.getPixels(
    element,
    circleCoordinates.left,
    circleCoordinates.top,
    circleCoordinates.width,
    circleCoordinates.height
  );

  // Calculate the mean & standard deviation from the pixels and the ellipse details.
  const ellipseMeanStdDev = calculateEllipseStatistics(
    pixels,
    circleCoordinates
  );

  let meanStdDevSUV;

  if (modality === 'PT') {
    meanStdDevSUV = {
      mean: calculateSUV(image, ellipseMeanStdDev.mean, true) || 0,
      stdDev: calculateSUV(image, ellipseMeanStdDev.stdDev, true) || 0,
    };
  }

  const area =
    Math.PI *
    ((circleCoordinates.width * (pixelSpacing.colPixelSpacing || 1)) / 2) *
    ((circleCoordinates.height * (pixelSpacing.rowPixelSpacing || 1)) / 2);

  return {
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
 * @returns {{ left: number, top: number, width: number, height: number }}
 */
function _getCirlceImageCoodinates(startHandle, endHandle) {
  const radius = _getDistance(startHandle, endHandle);

  return {
    left: Math.round(Math.min(startHandle.x - radius, endHandle.x)),
    top: Math.round(Math.min(startHandle.y - radius, endHandle.y)),
    width: radius * 2,
    height: radius * 2,
  };
}

/**
 * Returns the distance in canvas from the given coords to the center of the circle annotation.
 *
 * @param {*} startCoords - start point cooridnates
 * @param {*} endCoords - end point cooridnates
 * @returns {number} number - the distance between two points (start and end)
 */
function _getDistance(startCoords, endCoords) {
  const dx = startCoords.x - endCoords.x;
  const dy = startCoords.y - endCoords.y;

  return Math.sqrt(dx * dx + dy * dy);
}
