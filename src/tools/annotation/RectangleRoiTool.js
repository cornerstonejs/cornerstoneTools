import external from './../../externalModules.js';
import BaseMeasurementTool from '../base/BaseMeasurementTool.js';

// State
import { getToolState } from './../../stateManagement/toolState.js';
import toolStyle from './../../stateManagement/toolStyle.js';
import toolColors from './../../stateManagement/toolColors.js';

// Drawing
import {
  getNewContext,
  draw,
  drawHandles,
  drawRect,
  drawLinkedTextBox,
  setShadow,
} from './../../drawing/index.js';

// Util
import calculateSUV from './../../util/calculateSUV.js';
import getROITextBoxCoords from '../../util/getROITextBoxCoords.js';
import throttle from './../../util/throttle.js';
import { rectangleRoiCursor } from '../cursors/index.js';
import { getLogger } from '../../util/logger.js';
import getPixelSpacing from '../../util/getPixelSpacing';
import { getModule } from '../../store/index';
import * as measurementUncertainty from '../../util/measurementUncertaintyTool.js';
import Decimal from 'decimal.js';
import { formatArea } from '../../util/formatMeasurement.js';
import * as localization from '../../util/localization/localization.utils';

const logger = getLogger('tools:annotation:RectangleRoiTool');

/**
 * @public
 * @class RectangleRoiTool
 * @memberof Tools.Annotation
 * @classdesc Tool for drawing rectangular regions of interest, and measuring
 * the statistics of the enclosed pixels.
 * @extends Tools.Base.BaseMeasurementTool
 */
export default class RectangleRoiTool extends BaseMeasurementTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'RectangleRoi',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        drawHandles: true,
        drawHandlesOnHover: false,
        hideHandlesIfMoving: false,
        renderDashed: false,
        // showMinMax: false,
        // showHounsfieldUnits: true
        displayUncertainties: false,
      },
      svgCursor: rectangleRoiCursor,
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
    const validParameters = hasStartAndEndHandles;

    if (!validParameters) {
      logger.warn(
        `invalid parameters supplied to tool ${this.name}'s pointNearTool`
      );
    }

    if (!validParameters || data.visible === false) {
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

    const rect = {
      left: Math.min(startCanvas.x, endCanvas.x),
      top: Math.min(startCanvas.y, endCanvas.y),
      width: Math.abs(startCanvas.x - endCanvas.x),
      height: Math.abs(startCanvas.y - endCanvas.y),
    };

    const distanceToPoint = external.cornerstoneMath.rect.distanceToPoint(
      rect,
      coords
    );

    return distanceToPoint < distance;
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

    const eventData = evt.detail;
    const { image, element } = eventData;
    const lineWidth = toolStyle.getToolWidth();
    const lineDash = getModule('globalConfiguration').configuration.lineDash;
    const {
      handleRadius,
      drawHandlesOnHover,
      hideHandlesIfMoving,
      renderDashed,
    } = this.configuration;
    const context = getNewContext(eventData.canvasContext.canvas);

    // Meta
    const seriesModule =
      external.cornerstone.metaData.get('generalSeriesModule', image.imageId) ||
      {};

    // Pixel Spacing
    const modality = seriesModule.modality;

    draw(context, context => {
      // If we have tool data for this element - iterate over each set and draw it
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

        const rectOptions = { color };

        if (renderDashed) {
          rectOptions.lineDash = lineDash;
        }

        // Draw
        drawRect(
          context,
          element,
          data.handles.start,
          data.handles.end,
          rectOptions,
          'pixel',
          data.handles.initialRotation
        );

        if (this.configuration.drawHandles) {
          drawHandles(context, eventData, data.handles, handleOptions);
        }

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
          this.displayUncertainties,
          this.configuration
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
    toolState, // cachedStats: { Area, areaUncertainty, mean, stdDev, min, max, meanStdDevSUV }
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
    } = toolState.cachedStats;

    return _createTextBoxContent(
      context,
      isColorImage,
      { area, areaUncertainty, mean, stdDev, min, max, meanStdDevSUV },
      modality,
      hasPixelSpacing,
      displayUncertainties,
      options
    ).join('\n');
  }
}

/**
 * TODO: This is the same method (+ GetPixels) for the other ROIs
 * TODO: The pixel filtering is the unique bit
 *
 * @param {*} startHandle
 * @param {*} endHandle
 * @returns {{ left: number, top: number, width: number, height: number}}
 */
function _getRectangleImageCoordinates(startHandle, endHandle) {
  return {
    left: Math.min(startHandle.x, endHandle.x),
    top: Math.min(startHandle.y, endHandle.y),
    width: Math.abs(startHandle.x - endHandle.x),
    height: Math.abs(startHandle.y - endHandle.y),
  };
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
  // Retrieve the bounds of the rectangle in image coordinates
  const roiCoordinates = _getRectangleImageCoordinates(
    handles.start,
    handles.end
  );

  // Retrieve the array of pixels that the rectangle bounds cover
  const pixels = external.cornerstone.getPixels(
    element,
    roiCoordinates.left,
    roiCoordinates.top,
    roiCoordinates.width,
    roiCoordinates.height
  );

  // Calculate the mean & standard deviation from the pixels and the rectangle details
  const roiMeanStdDev = _calculateRectangleStats(pixels, roiCoordinates);

  let meanStdDevSUV;

  if (modality === 'PT') {
    meanStdDevSUV = {
      mean:
        measurementUncertainty.getGenericRounding(
          calculateSUV(image, roiMeanStdDev.mean, true)
        ) || 0,
      stdDev:
        measurementUncertainty.getGenericRounding(
          calculateSUV(image, roiMeanStdDev.stdDev, true)
        ) || 0,
    };
  }

  // Calculate the image area from the rectangle dimensions and pixel spacing
  const area =
    roiCoordinates.width *
    (pixelSpacing.colPixelSpacing || 1) *
    (roiCoordinates.height * (pixelSpacing.rowPixelSpacing || 1));

  const perimeter =
    roiCoordinates.width * 2 * (pixelSpacing.colPixelSpacing || 1) +
    roiCoordinates.height * 2 * (pixelSpacing.rowPixelSpacing || 1);

  const pixelDiagonal =
    measurementUncertainty.getPixelDiagonal(
      pixelSpacing.colPixelSpacing,
      pixelSpacing.rowPixelSpacing
    ) || 0;

  const areaUncertainty = perimeter * pixelDiagonal || 0;

  return {
    area: measurementUncertainty.roundArea(area, areaUncertainty) || 0,
    areaUncertainty:
      measurementUncertainty.roundUncertainty(areaUncertainty) || 0,
    perimeter,
    count: new Decimal(roiMeanStdDev.count) || 0,
    mean: measurementUncertainty.getGenericRounding(roiMeanStdDev.mean) || 0,
    variance: new Decimal(roiMeanStdDev.variance) || 0,
    stdDev:
      measurementUncertainty.getGenericRounding(roiMeanStdDev.stdDev) || 0,
    min: new Decimal(roiMeanStdDev.min) || 0,
    max: new Decimal(roiMeanStdDev.max) || 0,
    meanStdDevSUV,
  };
}

/**
 *
 *
 * @param {*} sp
 * @param {*} rectangle
 * @returns {{ count, number, mean: number,  variance: number,  stdDev: number,  min: number,  max: number }}
 */
function _calculateRectangleStats(sp, rectangle) {
  let sum = 0;
  let sumSquared = 0;
  let count = 0;
  let index = 0;
  let min = sp ? sp[0] : null;
  let max = sp ? sp[0] : null;

  for (let y = rectangle.top; y < rectangle.top + rectangle.height; y++) {
    for (let x = rectangle.left; x < rectangle.left + rectangle.width; x++) {
      sum += sp[index];
      sumSquared += sp[index] * sp[index];
      min = Math.min(min, sp[index]);
      max = Math.max(max, sp[index]);
      count++; // TODO: Wouldn't this just be sp.length?
      index++;
    }
  }

  if (count === 0) {
    return {
      count,
      mean: 0.0,
      variance: 0.0,
      stdDev: 0.0,
      min: 0.0,
      max: 0.0,
    };
  }

  const mean = sum / count;
  const variance = sumSquared / count - mean * mean;

  return {
    count,
    mean,
    variance,
    stdDev: Math.sqrt(variance),
    min,
    max,
  };
}

/**
 *
 *
 * @param {*} startHandle
 * @param {*} endHandle
 * @returns {Array.<{x: number, y: number}>}
 */
function _findTextBoxAnchorPoints(startHandle, endHandle) {
  const { left, top, width, height } = _getRectangleImageCoordinates(
    startHandle,
    endHandle
  );

  return [
    {
      // Top middle point of rectangle
      x: left + width / 2,
      y: top,
    },
    {
      // Left middle point of rectangle
      x: left,
      y: top + height / 2,
    },
    {
      // Bottom middle point of rectangle
      x: left + width / 2,
      y: top + height,
    },
    {
      // Right middle point of rectangle
      x: left + width,
      y: top + height / 2,
    },
  ];
}

function _getUnit(modality, showHounsfieldUnits) {
  return modality === 'CT' && showHounsfieldUnits !== false ? 'HU' : 'SI';
}

/**
 * TODO: This is identical to EllipticalROI's same fn
 * TODO: We may want to make this a utility for ROIs with these values?
 *
 * @param {*} context
 * @param {*} isColorImage
 * @param {*} { area, mean, stdDev, min, max, meanStdDevSUV }
 * @param {*} modality
 * @param {*} hasPixelSpacing
 * @param {*} [options={}]
 * @returns {string[]}
 */
function _createTextBoxContent(
  context,
  isColorImage,
  {
    area = 0,
    areaUncertainty,
    mean = 0,
    stdDev = 0,
    min = 0,
    max = 0,
    meanStdDevSUV = 0,
  } = {},
  modality,
  hasPixelSpacing,
  displayUncertainties,
  options = {}
) {
  const showMinMax = options.showMinMax || false;
  const textLines = [];

  const otherLines = [];

  if (!isColorImage) {
    const hasStandardUptakeValues =
      meanStdDevSUV &&
      meanStdDevSUV.mean !== 0 &&
      meanStdDevSUV.mean !== undefined;
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
  otherLines.forEach(x => textLines.push(x));

  return textLines;
}
