import external from './../../externalModules.js';
import BaseMeasurementTool from '../base/BaseMeasurementTool.js';

// State
import { getToolState } from './../../stateManagement/toolState.js';
import toolStyle from './../../stateManagement/toolStyle.js';
import toolColors from './../../stateManagement/toolColors.js';
import { getModule } from '../../store/index';

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
import * as localization from '../../util/localization/localization.utils';
import throttle from './../../util/throttle.js';
import { getLogger } from '../../util/logger.js';
import getPixelSpacing from '../../util/getPixelSpacing';
import { circleRoiCursor } from '../cursors/index.js';
import getCircleCoords from '../../util/getCircleCoords';
import * as measurementUncertainty from '../../util/measurementUncertaintyTool.js';
import Decimal from 'decimal.js';
import { formatArea, formatDiameter } from '../../util/formatMeasurement.js';

const logger = getLogger('tools:annotation:CircleRoiTool');

/**
 * @public
 * @class CircleRoiTool
 * @memberof Tools.Annotation
 * @classdesc Tool for drawing circular regions of interest, and measuring
 * the statistics of the enclosed pixels.
 * @extends Tools.Base.BaseMeasurementTool
 */
export default class CircleRoiTool extends BaseMeasurementTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'CircleRoi',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: circleRoiCursor,
      configuration: {
        centerPointRadius: 0,
        renderDashed: false,
        hideHandlesIfMoving: false,
        displayUncertainties: false,
      },
    };

    super(props, defaultProps);

    this.throttledUpdateCachedStats = throttle(this.updateCachedStats, 110);
  }

  createNewMeasurement(eventData) {
    const goodEventData =
      eventData && eventData.currentPoints && eventData.currentPoints.image;

    if (!goodEventData) {
      logger.error(
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

    const getDistance = external.cornerstoneMath.point.distance;

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
    const distanceFromCenter = getDistance(startCanvas, coords);

    // Getting radius of circle annotation in canvas
    const radius = getDistance(startCanvas, endCanvas);

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
    const pixelSpacing = getPixelSpacing(image, data);

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

    const getDistance = external.cornerstoneMath.point.distance;
    const eventData = evt.detail;
    const { image, element, canvasContext } = eventData;
    const lineWidth = toolStyle.getToolWidth();
    const {
      handleRadius,
      drawHandlesOnHover,
      hideHandlesIfMoving,
      renderDashed,
      centerPointRadius,
    } = this.configuration;
    const newContext = getNewContext(canvasContext.canvas);
    const lineDash = getModule('globalConfiguration').configuration.lineDash;

    // Meta
    const seriesModule =
      external.cornerstone.metaData.get('generalSeriesModule', image.imageId) ||
      {};

    // Pixel Spacing
    const modality = seriesModule.modality;
    const displayUncertainties = this.displayUncertainties;

    draw(newContext, context => {
      // If we have tool data for this element, iterate over each set and draw it
      for (let i = 0; i < toolData.data.length; i++) {
        const data = toolData.data[i];

        if (data.visible === false) {
          continue;
        }

        const { rowPixelSpacing, colPixelSpacing } = getPixelSpacing(
          image,
          data
        );
        const hasPixelSpacing = Boolean(rowPixelSpacing && colPixelSpacing);

        // Configure
        const color = toolColors.getColorIfActive(data);
        const handleOptions = {
          color,
          handleRadius,
          drawHandlesIfActive: drawHandlesOnHover,
          hideHandlesIfMoving,
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
        const radius = getDistance(startCanvas, endCanvas);

        const circleOptions = { color };

        if (renderDashed) {
          circleOptions.lineDash = lineDash;
        }

        // Draw Circle
        drawCircle(
          context,
          element,
          data.handles.start,
          radius,
          circleOptions,
          'pixel'
        );

        if (centerPointRadius && radius > 3 * centerPointRadius) {
          drawCircle(
            context,
            element,
            data.handles.start,
            centerPointRadius,
            circleOptions,
            'pixel'
          );
        }

        if (data.handles) {
          data.handles.start.drawnIndependently = true;
          data.handles.end.drawnIndependently = true;
        }

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
          displayUncertainties
        );

        data.unit = _getUnit(modality, this.configuration.showHounsfieldUnits);

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

  /**
   * Static method which returns based on the given parameters the formatted text.
   * The text is in the same format as it is also drawn on the canvas in the end.
   **/
  static getToolTextFromToolState(
    context,
    isColorImage,
    toolState, // cachedStats: { Area, areaUncertainty, mean, stdDev, min, max, meanStdDevSUV, diameter, diameterUncertainty, radius }
    modality,
    hasPixelSpacing,
    displayUncertainties,
    options = {}
  ) {
    const {
      area,
      areaUncertainty,
      mean,
      stdDev,
      min,
      max,
      meanStdDevSUV,
      diameter,
      diameterUncertainty,
      radius,
    } = toolState.cachedStats;

    return _createTextBoxContent(
      context,
      isColorImage,
      {
        area,
        areaUncertainty,
        mean,
        stdDev,
        min,
        max,
        meanStdDevSUV,
        diameter,
        diameterUncertainty,
        radius,
      },
      modality,
      hasPixelSpacing,
      displayUncertainties,
      options
    ).join('\n');
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
  const { left, top, width, height } = getCircleCoords(startHandle, endHandle);

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

function _getUnit(modality, showHounsfieldUnits) {
  return modality === 'CT' && showHounsfieldUnits !== false ? 'HU' : 'SI';
}

/**
 *
 *
 * @param {*} context
 * @param {*} isColorImage
 * @param {*} { area, mean, stdDev, min, max, meanStdDevSUV, diameterUncertainty, areaUncertainty }
 * @param {*} modality
 * @param {*} hasPixelSpacing
 * @param {*} [options={}] - { showMinMax, showHounsfieldUnits }
 * @returns {string[]}
 */
function _createTextBoxContent(
  context,
  isColorImage,
  {
    area = 0,
    areaUncertainty,
    radius = 0,
    perimeter = 0,
    mean = 0,
    stdDev = 0,
    min = 0,
    max = 0,
    meanStdDevSUV = 0,
    diameter,
    diameterUncertainty,
  } = {},
  modality,
  hasPixelSpacing,
  displayUncertainties,
  options = {}
) {
  const showMinMax = options.showMinMax || false;
  const textLines = [];

  // Don't display mean/standardDev for color images
  const otherLines = [];

  if (!isColorImage) {
    const hasStandardUptakeValues = meanStdDevSUV && meanStdDevSUV.mean !== 0;
    const unit = _getUnit(modality, options.showHounsfieldUnits);

    let meanString = mean
      ? `${localization.translate('average')}: ${localization.localizeNumber(
          mean
        )} ${unit}`
      : `${localization.translate('average')}: - ${unit}`;
    const stdDevString = stdDev
      ? `${localization.translate(
          'standardDeviation'
        )}: ${localization.localizeNumber(stdDev)} ${unit}`
      : `${localization.translate('standardDeviation')}: - ${unit}`;

    // If this image has SUV values to display, concatenate them to the text line
    if (hasStandardUptakeValues) {
      const SUVtext = ' SUV: ';

      const meanSuvString = `${SUVtext}${meanStdDevSUV.mean}`;
      const stdDevSuvString = `${SUVtext}${meanStdDevSUV.stdDev}`;

      const targetStringLength = Math.floor(
        context.measureText(`${stdDevString}     `).width
      );

      while (context.measureText(meanString).width < targetStringLength) {
        meanString += ' ';
      }

      otherLines.push(`${meanString}${meanSuvString}`);
      otherLines.push(`${stdDevString}     ${stdDevSuvString}`);
    } else {
      otherLines.push(`${meanString}`);
      otherLines.push(`${stdDevString}`);
    }

    if (showMinMax) {
      let minString = `Min: ${min} ${unit}`;
      const maxString = `Max: ${max} ${unit}`;
      const targetStringLength = hasStandardUptakeValues
        ? Math.floor(context.measureText(`${stdDevString}     `).width)
        : Math.floor(context.measureText(`${meanString}     `).width);

      while (context.measureText(minString).width < targetStringLength) {
        minString += ' ';
      }

      otherLines.push(`${minString}${maxString}`);
    }
  }

  textLines.push(
    formatArea(area, hasPixelSpacing, areaUncertainty, displayUncertainties)
  );

  // TextLines.push(_formatArea(area, hasPixelSpacing));
  // if (radius) {
  //   textLines.push(_formatLength(radius, 'Radius', hasPixelSpacing));
  // }
  // if (perimeter) {
  //   textLines.push(_formatLength(perimeter, 'Perimeter', hasPixelSpacing));
  // }
  // otherLines.forEach(x => textLines.push(x));

  if (diameter) {
    textLines.push(
      formatDiameter(
        diameter,
        hasPixelSpacing,
        diameterUncertainty,
        displayUncertainties
      )
    );
  }

  otherLines.forEach(x => textLines.push(x));

  return textLines;
}

function _formatLength(value, name, hasPixelSpacing) {
  if (!value) {
    return '';
  }
  const suffix = hasPixelSpacing ? ' mm' : ' px';

  return `${name}: ${numbersWithCommas(value.toFixed(1))}${suffix}`;
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
  const circleCoordinates = getCircleCoords(handles.start, handles.end);

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
      mean:
        measurementUncertainty.getGenericRounding(
          calculateSUV(image, ellipseMeanStdDev.mean, true)
        ) || 0,
      stdDev:
        measurementUncertainty.getGenericRounding(
          calculateSUV(image, ellipseMeanStdDev.stdDev, true)
        ) || 0,
    };
  }

  const radius =
    (circleCoordinates.width *
      ((pixelSpacing && pixelSpacing.colPixelSpacing) || 1)) /
    2;

  const perimeter = new Decimal(2 * Math.PI * radius) || 0;

  const diameter = radius * 2 || 0;

  const pixelDiagonal = measurementUncertainty.getPixelDiagonal(
    pixelSpacing.colPixelSpacing,
    pixelSpacing.rowPixelSpacing
  );

  const areaUncertainty = perimeter * pixelDiagonal || 0;

  const diameterUncertainty = new Decimal(pixelDiagonal * Decimal.sqrt(2)) || 0;

  const area =
    Math.PI *
    ((circleCoordinates.width *
      ((pixelSpacing && pixelSpacing.colPixelSpacing) || 1)) /
      2) *
    ((circleCoordinates.height *
      ((pixelSpacing && pixelSpacing.rowPixelSpacing) || 1)) /
      2);

  return {
    area: measurementUncertainty.roundArea(area, areaUncertainty) || 0,
    areaUncertainty: measurementUncertainty.roundUncertainty(areaUncertainty),
    radius: radius || 0,
    diameter: measurementUncertainty.roundArea(diameter, diameterUncertainty),
    diameterUncertainty: measurementUncertainty.roundUncertainty(
      diameterUncertainty
    ),
    perimeter: perimeter || 0,
    count: ellipseMeanStdDev.count || 0,
    mean:
      measurementUncertainty.getGenericRounding(ellipseMeanStdDev.mean) || 0,
    variance: ellipseMeanStdDev.variance || 0,
    stdDev:
      measurementUncertainty.getGenericRounding(ellipseMeanStdDev.stdDev) || 0,
    min: ellipseMeanStdDev.min || 0,
    max: ellipseMeanStdDev.max || 0,
    meanStdDevSUV,
  };
}
