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
      configuration: {
        // ShowMinMax: false,
        // ShowHounsfieldUnits: true,
      },
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

  pointNearTool(element, data, coords, interactionType) {
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

    const distance = interactionType === 'mouse' ? 15 : 25;
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
    const seriesModule =
      external.cornerstone.metaData.get('generalSeriesModule', image.imageId) ||
      {};
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

        // Default to textbox on right side of ROI
        if (!data.handles.textBox.hasMoved) {
          data.handles.textBox.x = Math.max(
            data.handles.start.x,
            data.handles.end.x
          );
          data.handles.textBox.y =
            (data.handles.start.y + data.handles.end.y) / 2;
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
          0,
          true
        );
      }
    });
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
  data.invalidated = false;
}

/**
 *
 *
 * @param {*} startHandle
 * @param {*} endHandle
 * @returns
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
 * @param {*} [{ area, mean, stdDev, min, max, meanStdDevSUV }={}]
 * @param {*} modality
 * @param {*} hasPixelSpacing
 * @param {*} [options={}] - { showMinMax, showHounsfieldUnits }
 * @returns
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
 * @returns
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
    ((ellipseCoordinates.width * (pixelSpacing.columnPixelSpacing || 1)) / 2) *
    ((ellipseCoordinates.height * (pixelSpacing.rowPixelSpacing || 1)) / 2);

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
