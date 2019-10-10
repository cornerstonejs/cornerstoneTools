import external from '../externalModules.js';
import BaseTool from './base/BaseTool.js';
// Drawing
import { getNewContext, draw, setShadow, drawLine } from '../drawing/index.js';
import toolStyle from '../stateManagement/toolStyle.js';
import toolColors from '../stateManagement/toolColors.js';
import { getLogger } from '../util/logger.js';

const logger = getLogger('tools:ScaleOverlayTool');

/**
 * @public
 * @class ScaleOverlayTool
 * @memberof Tools
 *
 * @classdesc Tool for displaying a scale overlay on the image.
 * @extends Tools.Base.BaseTool
 */
export default class ScaleOverlayTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'ScaleOverlay',
      configuration: {
        minorTickLength: 12.5,
        majorTickLength: 25,
      },
      mixins: ['enabledOrDisabledBinaryTool'],
    };

    super(props, defaultProps);
  }

  enabledCallback(element) {
    this.forceImageUpdate(element);
  }

  disabledCallback(element) {
    this.forceImageUpdate(element);
  }

  forceImageUpdate(element) {
    const enabledElement = external.cornerstone.getEnabledElement(element);

    if (enabledElement.image) {
      external.cornerstone.updateImage(element);
    }
  }

  renderToolData(evt) {
    const eventData = evt.detail;

    const context = getNewContext(eventData.canvasContext.canvas);
    const { image, viewport, element } = eventData;

    let rowPixelSpacing = image.rowPixelSpacing;
    let colPixelSpacing = image.columnPixelSpacing;
    const imagePlane = external.cornerstone.metaData.get(
      'imagePlaneModule',
      image.imageId
    );

    if (imagePlane) {
      rowPixelSpacing =
        imagePlane.rowPixelSpacing || imagePlane.rowImagePixelSpacing;
      colPixelSpacing =
        imagePlane.columnPixelSpacing || imagePlane.colImagePixelSpacing;
    }

    // Check whether pixel spacing is defined
    if (!rowPixelSpacing || !colPixelSpacing) {
      logger.warn(
        `unable to define rowPixelSpacing or colPixelSpacing from data on ${this.name}'s renderToolData`
      );

      return;
    }

    const canvasSize = {
      width: context.canvas.width,
      height: context.canvas.height,
    };

    // Distance between intervals is 10mm
    const verticalIntervalScale = (10.0 / rowPixelSpacing) * viewport.scale;
    const horizontalIntervalScale = (10.0 / colPixelSpacing) * viewport.scale;

    // 0.1 and 0.05 gives margin to horizontal and vertical lines
    const hscaleBounds = computeScaleBounds(canvasSize, 0.25, 0.05);
    const vscaleBounds = computeScaleBounds(canvasSize, 0.05, 0.15);

    if (
      !canvasSize.width ||
      !canvasSize.height ||
      !hscaleBounds ||
      !vscaleBounds
    ) {
      return;
    }

    const color = toolColors.getToolColor();
    const lineWidth = toolStyle.getToolWidth();

    const imageAttributes = Object.assign(
      {},
      {
        hscaleBounds,
        vscaleBounds,
        verticalMinorTick: verticalIntervalScale,
        horizontalMinorTick: horizontalIntervalScale,
        verticalLine: {
          start: {
            x: vscaleBounds.bottomRight.x,
            y: vscaleBounds.topLeft.y,
          },
          end: {
            x: vscaleBounds.bottomRight.x,
            y: vscaleBounds.bottomRight.y,
          },
        },
        horizontalLine: {
          start: {
            x: hscaleBounds.topLeft.x,
            y: hscaleBounds.bottomRight.y,
          },
          end: {
            x: hscaleBounds.bottomRight.x,
            y: hscaleBounds.bottomRight.y,
          },
        },
        color,
        lineWidth,
      },
      this.configuration
    );

    draw(context, context => {
      setShadow(context, imageAttributes);

      // Draw vertical line
      drawLine(
        context,
        element,
        imageAttributes.verticalLine.start,
        imageAttributes.verticalLine.end,
        {
          color: imageAttributes.color,
          lineWidth: imageAttributes.lineWidth,
        },
        'canvas'
      );
      drawVerticalScalebarIntervals(context, element, imageAttributes);

      // Draw horizontal line
      drawLine(
        context,
        element,
        imageAttributes.horizontalLine.start,
        imageAttributes.horizontalLine.end,
        {
          color: imageAttributes.color,
          lineWidth: imageAttributes.lineWidth,
        },
        'canvas'
      );
      drawHorizontalScalebarIntervals(context, element, imageAttributes);
    });
  }
}

/**
 * Computes the max bound for scales on the image
 * @param  {{width: number, height: number}} canvasSize
 * @param  {number} horizontalReduction
 * @param  {number} verticalReduction
 * @returns {Object.<string, { x:number, y:number }>}
 */
const computeScaleBounds = (
  canvasSize,
  horizontalReduction,
  verticalReduction
) => {
  const hReduction = horizontalReduction * Math.min(1000, canvasSize.width);
  const vReduction = verticalReduction * Math.min(1000, canvasSize.height);
  const canvasBounds = {
    left: hReduction,
    top: vReduction,
    width: canvasSize.width - 2 * hReduction,
    height: canvasSize.height - 2 * vReduction,
  };

  return {
    topLeft: {
      x: canvasBounds.left,
      y: canvasBounds.top,
    },
    bottomRight: {
      x: canvasBounds.left + canvasBounds.width,
      y: canvasBounds.top + canvasBounds.height,
    },
  };
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {HTMLElement} element
 * @param {Object} imageAttributes
 * @returns {void}
 */
const drawVerticalScalebarIntervals = (context, element, imageAttributes) => {
  let i = 0;

  while (
    imageAttributes.verticalLine.start.y +
      i * imageAttributes.verticalMinorTick <=
    imageAttributes.vscaleBounds.bottomRight.y
  ) {
    const { color, lineWidth } = imageAttributes;
    const startPoint = {
      x: imageAttributes.verticalLine.start.x,
      y:
        imageAttributes.verticalLine.start.y +
        i * imageAttributes.verticalMinorTick,
    };

    const endPoint = {
      x: 0,
      y:
        imageAttributes.verticalLine.start.y +
        i * imageAttributes.verticalMinorTick,
    };

    if (i % 5 === 0) {
      endPoint.x =
        imageAttributes.verticalLine.start.x - imageAttributes.majorTickLength;
    } else {
      endPoint.x =
        imageAttributes.verticalLine.start.x - imageAttributes.minorTickLength;
    }

    drawLine(
      context,
      element,
      startPoint,
      endPoint,
      {
        color,
        lineWidth,
      },
      'canvas'
    );

    i++;
  }
};

/**
 * @param {CanvasRenderingContext2D} context
 * @param {HTMLElement} element
 * @param {Object} imageAttributes
 * @returns {void}
 */
const drawHorizontalScalebarIntervals = (context, element, imageAttributes) => {
  let i = 0;

  while (
    imageAttributes.horizontalLine.start.x +
      i * imageAttributes.horizontalMinorTick <=
    imageAttributes.hscaleBounds.bottomRight.x
  ) {
    const { color, lineWidth } = imageAttributes;
    const startPoint = {
      x:
        imageAttributes.horizontalLine.start.x +
        i * imageAttributes.horizontalMinorTick,
      y: imageAttributes.horizontalLine.start.y,
    };

    const endPoint = {
      x:
        imageAttributes.horizontalLine.start.x +
        i * imageAttributes.horizontalMinorTick,
      y: 0,
    };

    if (i % 5 === 0) {
      endPoint.y =
        imageAttributes.horizontalLine.start.y -
        imageAttributes.majorTickLength;
    } else {
      endPoint.y =
        imageAttributes.horizontalLine.start.y -
        imageAttributes.minorTickLength;
    }

    drawLine(
      context,
      element,
      startPoint,
      endPoint,
      {
        color,
        lineWidth,
      },
      'canvas'
    );

    i++;
  }
};
