import external from './../../externalModules.js';
import BaseAnnotationTool from '../base/BaseAnnotationTool.js';
import store from '../../store/index.js';
import language from '../../language.js';

// State
import {
  getToolState,
  addToolState,
  removeToolState,
} from './../../stateManagement/toolState.js';
import toolStyle from './../../stateManagement/toolStyle.js';
import toolColors from './../../stateManagement/toolColors.js';
// Manipulators
import { moveNewHandle } from './../../manipulators/index.js';

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
import EVENTS from '../../events.js';
import {
  calculateEllipseStatistics,
} from './../../util/ellipse/index.js';
import getROITextBoxCoords from '../../util/getROITextBoxCoords.js';
import numbersWithCommas from './../../util/numbersWithCommas.js';
import throttle from './../../util/throttle.js';
import { ellipticalRoiCursor } from '../cursors/index.js';
import { getLogger } from '../../util/logger.js';
import getPixelSpacing from '../../util/getPixelSpacing';
import triggerEvent from '../../util/triggerEvent.js';

const logger = getLogger('tools:annotation:EllipticalRoiTool');

/**
 * @public
 * @class EllipticalRoiTool
 * @memberof Tools.Annotation
 * @classdesc Tool for drawing elliptical regions of interest, and measuring
 * the statistics of the enclosed pixels.
 * @extends Tools.Base.BaseAnnotationTool
 */
export default class EllipticalRoiTool extends BaseAnnotationTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'EllipticalRoi',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        showMinMax: true,
        showHounsfieldUnits: true,
      },
      svgCursor: ellipticalRoiCursor,
    };

    super(props, defaultProps);

    this.preventNewMeasurement = false;
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
    const { image, element } = eventData;
    const lineWidth = toolStyle.getToolWidth();
    const { handleRadius, drawHandlesOnHover } = this.configuration;
    const context = getNewContext(eventData.canvasContext.canvas);
    const { rowPixelSpacing, colPixelSpacing } = getPixelSpacing(image);

    // Meta
    const seriesModule =
      external.cornerstone.metaData.get('generalSeriesModule', image.imageId) ||
      {};

    // Pixel Spacing
    const modality = seriesModule.modality;
    const hasPixelSpacing = rowPixelSpacing && colPixelSpacing;

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

        // drawRect(
        //   context,
        //   element,
        //   data.handles.start,
        //   data.handles.end,
        //   {
        //     color,
        //   },
        //   'pixel',
        //   data.handles.initialRotation
        // );

        // Draw
        drawEllipse(
          context,
          element,
          data.handles.start,
          data.handles.end,
          {
            color,
          },
          'pixel',
          data.handles.initialRotation
        );
        if (data.active) {
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
          this.configuration
        );
        const textColor = toolColors.getTextColor();
        if (data.cachedStats.area.toFixed(2) > 0) {
          drawLinkedTextBox(
            context,
            element,
            data.handles.textBox,
            textBoxContent,
            data.handles,
            textBoxAnchorPoints,
            textColor,
            lineWidth,
            10,
            true
          );
        }
      }
    });
  }

  addNewMeasurement(evt, interactionType) {
    const eventData = evt.detail;
    const element = eventData.element;
    const measurementData = this.createNewMeasurement(eventData);

    if (!measurementData) {
      return;
    }

    // Associate this data with this imageId so we can render it and manipulate it
    addToolState(element, this.name, measurementData);

    const toolOptions = Object.assign(
      {},
      {
        doneMovingCallback: () => {
          const eventType = EVENTS.MEASUREMENT_COMPLETED;
          const eventData = {
            toolName: this.name,
            element,
            measurementData,
          };

          triggerEvent(element, eventType, eventData);
          if (
            !measurementData.cachedStats ||
            measurementData.cachedStats.area === 0
          ) {
            measurementData.visible = false;
            removeToolState(element, this.name, measurementData);
          }
        },
      },
      this.options
    );

    moveNewHandle(
      eventData,
      this.name,
      measurementData,
      measurementData.handles.end,
      toolOptions,
      interactionType
    );
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
  const { left, top, width, height } = _getEllipseImageCoordinates(
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
  { area, mean, stdDev, min, max, avg, meanStdDevSUV } = {},
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
    const suffix = showHounsfieldUnits ? ' HU' : '';

    // let meanString = `Mean: ${numbersWithCommas(mean.toFixed(2))}${suffix}`;
    // const stdDevString = `Std Dev: ${numbersWithCommas(
    //   stdDev.toFixed(2)
    // )}${suffix}`;

    // If this image has SUV values to display, concatenate them to the text line
    // if (hasStandardUptakeValues) {
    //   const SUVtext = ' SUV: ';

    //   const meanSuvString = `${SUVtext}${numbersWithCommas(
    //     meanStdDevSUV.mean.toFixed(2)
    //   )}`;
    //   const stdDevSuvString = `${SUVtext}${numbersWithCommas(
    //     meanStdDevSUV.stdDev.toFixed(2)
    //   )}`;

    //   const targetStringLength = Math.floor(
    //     context.measureText(`${stdDevString}     `).width
    //   );

    //   while (context.measureText(meanString).width < targetStringLength) {
    //     meanString += ' ';
    //   }

    //   otherLines.push(`${meanString}${meanSuvString}`);
    //   otherLines.push(`${stdDevString}     ${stdDevSuvString}`);
    // } else {
    //   otherLines.push(`${meanString}     ${stdDevString}`);
    // }

    if (showMinMax) {
      const lang = store.modules.globalConfiguration.state.language;
      let minString = `${language[lang].min} ${min}${suffix}`;
      const maxString = `${language[lang].max} ${max}${suffix}`;
      const avgString = `${language[lang].avg} ${avg}${suffix}`;
      const stdDevString = `${language[lang].stdDev} ${stdDev}${suffix}`;
      // const targetStringLength = hasStandardUptakeValues
      //   ? Math.floor(context.measureText(`${stdDevString}     `).width)
      //   : Math.floor(context.measureText(`${meanString}     `).width);

      // while (context.measureText(minString).width < targetStringLength) {
      //   minString += ' ';
      // }

      otherLines.push(minString);
      otherLines.push(maxString);
      otherLines.push(avgString);
      otherLines.push(stdDevString);
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
    ? ` cm${String.fromCharCode(178)}`
    : ` px${String.fromCharCode(178)}`;

  return `${language[store.modules.globalConfiguration.state.language].area} ${numbersWithCommas((area / 100).toFixed(2))}${suffix}`;
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

  // Calculate the mean & standard deviation from the pixels and the ellipse details.
  const ellipseMeanStdDev = calculateEllipseStatistics(
    pixels,
    ellipseCoordinates
  );

  // const center = {x: ellipseCoordinates.left, y: ellipseCoordinates.top}
  // const info = CtCalculator.getEllipseInfo(image.getDicom(), center,  ellipseCoordinates.width, ellipseCoordinates.height);

  let meanStdDevSUV;

  if (modality === 'PT') {
    meanStdDevSUV = {
      mean: calculateSUV(image, ellipseMeanStdDev.mean, true) || 0,
      stdDev: calculateSUV(image, ellipseMeanStdDev.stdDev, true) || 0,
    };
  }

  // Calculate the image area from the ellipse dimensions and pixel spacing
  const area =
    Math.PI *
    ((ellipseCoordinates.width * (pixelSpacing.colPixelSpacing || 1)) / 2) *
    ((ellipseCoordinates.height * (pixelSpacing.rowPixelSpacing || 1)) / 2);

  return {
    area: area || 0,
    count: ellipseMeanStdDev.count || 0,
    mean: ellipseMeanStdDev.mean || 0,
    variance: ellipseMeanStdDev.variance || 0,
    stdDev: ellipseMeanStdDev.stdDev.toFixed() || 0,
    min: ellipseMeanStdDev.min || 0,
    max: ellipseMeanStdDev.max || 0,
    avg: ellipseMeanStdDev.mean.toFixed() || 0,
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
function _getEllipseImageCoordinates(startHandle, endHandle) {
  return {
    left: Math.round(Math.min(startHandle.x, endHandle.x)),
    top: Math.round(Math.min(startHandle.y, endHandle.y)),
    width: Math.round(Math.abs(startHandle.x - endHandle.x)),
    height: Math.round(Math.abs(startHandle.y - endHandle.y)),
  };
}
