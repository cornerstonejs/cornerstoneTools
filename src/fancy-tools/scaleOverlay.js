import external from './../externalModules.js';
import baseTool from './../base/baseTool.js';
// Drawing
import { getNewContext, draw, path } from '../util/drawing.js';

const cornerstone = external.cornerstone;

const drawLine = (context, startPoint, endPoint) => {
  context.moveTo(startPoint.x, startPoint.y);
  context.lineTo(endPoint.x, endPoint.y);
};

/**
 * Computes the max bound for scales on the image
 * @param  {} canvasSize
 * @param  {} horizontalReduction
 * @param  {} verticalReduction
 */
const computeScaleBounds = (canvasSize, horizontalReduction, verticalReduction) => {
  const hReduction = horizontalReduction * Math.min(1000, canvasSize.width);
  const vReduction = verticalReduction * Math.min(1000, canvasSize.height);
  const canvasBounds = {
    left: hReduction,
    top: vReduction,
    width: canvasSize.width - 2 * hReduction,
    height: canvasSize.height - 2 * vReduction
  };

  return {
    topLeft: {
      x: canvasBounds.left,
      y: canvasBounds.top
    },
    bottomRight: {
      x: canvasBounds.left + canvasBounds.width,
      y: canvasBounds.top + canvasBounds.height
    }
  };
};

/**
 * Draw both scales into canvas
 * @param  {} context
 * @param  {} imageAttributes
 */
const drawScalebars = (context, imageAttributes) => {
  context.shadowColor = imageAttributes.shadowColor;
  context.shadowBlur = imageAttributes.shadowBlur;
  const { color, lineWidth } = imageAttributes;

  path(context, { color,
    lineWidth }, (context) => {
    drawVerticalScalebar(context, imageAttributes);
    drawHorizontalScalebar(context, imageAttributes);
  });
};

/**
 * @param  {} context
 * @param  {} imageAttributes
 */
const drawVerticalScalebarIntervals = (context, imageAttributes) => {
  let i = 0;

  while (imageAttributes.verticalLine.start.y + i * imageAttributes.verticalMinorTick <= imageAttributes.vscaleBounds.bottomRight.y) {

    const startPoint = {
      x: imageAttributes.verticalLine.start.x,
      y: imageAttributes.verticalLine.start.y + i * imageAttributes.verticalMinorTick
    };

    const endPoint = {
      x: 0,
      y: imageAttributes.verticalLine.start.y + i * imageAttributes.verticalMinorTick
    };

    if (i % 5 === 0) {

      endPoint.x = imageAttributes.verticalLine.start.x - imageAttributes.majorTickLength;
    } else {

      endPoint.x = imageAttributes.verticalLine.start.x - imageAttributes.minorTickLength;
    }

    drawLine(context, startPoint, endPoint);

    i++;
  }
};

const drawHorizontalScalebarIntervals = (context, imageAttributes) => {
  let i = 0;

  while (imageAttributes.horizontalLine.start.x + i * imageAttributes.horizontalMinorTick <= imageAttributes.hscaleBounds.bottomRight.x) {

    const startPoint = {
      x: imageAttributes.horizontalLine.start.x + i * imageAttributes.horizontalMinorTick,
      y: imageAttributes.horizontalLine.start.y
    };

    const endPoint = {
      x: imageAttributes.horizontalLine.start.x + i * imageAttributes.horizontalMinorTick,
      y: 0
    };

    if (i % 5 === 0) {
      endPoint.y = imageAttributes.horizontalLine.start.y - imageAttributes.majorTickLength;
    } else {
      endPoint.y = imageAttributes.horizontalLine.start.y - imageAttributes.minorTickLength;
    }

    drawLine(context, startPoint, endPoint);

    i++;
  }
};

function drawVerticalScalebar (context, imageAttributes) {
  const startPoint = {
    x: imageAttributes.verticalLine.start.x,
    y: imageAttributes.verticalLine.start.y
  };
  const endPoint = {
    x: imageAttributes.verticalLine.end.x,
    y: imageAttributes.verticalLine.end.y
  };

  const { color, lineWidth } = imageAttributes;

  path(context, { color,
    lineWidth }, (context) => {
    drawLine(context, startPoint, endPoint);
    drawVerticalScalebarIntervals(context, imageAttributes);
  });
}

function drawHorizontalScalebar (context, imageAttributes) {
  const startPoint = {
    x: imageAttributes.horizontalLine.start.x,
    y: imageAttributes.horizontalLine.start.y
  };
  const endPoint = {
    x: imageAttributes.horizontalLine.end.x,
    y: imageAttributes.horizontalLine.end.y
  };

  drawLine(context, startPoint, endPoint);
  drawHorizontalScalebarIntervals(context, imageAttributes);
}

export default class extends baseTool {
  constructor (name) {
    super({
      name: name || 'scaleOverlay',
      configuration: {
        color: 'white',
        lineWidth: 2,
        shadowColor: 'black',
        shadowBlur: 4,
        minorTickLength: 12.5,
        majorTickLength: 25
      }
    });
  }

  enabledCallback (element) {
    external.cornerstone.updateImage(element);
  }

  disabledCallback (element) {
    external.cornerstone.updateImage(element);
  }

  renderToolData (evt) {
    const eventData = evt.detail;

    const context = getNewContext(eventData.canvasContext.canvas);
    const { image, viewport } = eventData;

    let rowPixelSpacing = image.rowPixelSpacing;
    let colPixelSpacing = image.columnPixelSpacing;
    const imagePlane = cornerstone.metaData.get('imagePlaneModule', image.imageId);

    if (imagePlane) {
      rowPixelSpacing = imagePlane.rowPixelSpacing || imagePlane.rowImagePixelSpacing;
      colPixelSpacing = imagePlane.columnPixelSpacing || imagePlane.colImagePixelSpacing;
    }

    // Check whether pixel spacing is defined
    if (!rowPixelSpacing || !colPixelSpacing) {
      return;
    }

    const canvasSize = {
      width: context.canvas.width,
      height: context.canvas.height
    };

    // Distance between intervals is 10mm
    const verticalIntervalScale = (10.0 / rowPixelSpacing) * viewport.scale;
    const horizontalIntervalScale = (10.0 / colPixelSpacing) * viewport.scale;

    // 0.1 and 0.05 gives margin to horizontal and vertical lines
    const hscaleBounds = computeScaleBounds(canvasSize, 0.25, 0.05);
    const vscaleBounds = computeScaleBounds(canvasSize, 0.05, 0.15);

    if (!canvasSize.width || !canvasSize.height || !hscaleBounds || !vscaleBounds) {
      return;
    }

    const imageAttributes = Object.assign({}, {
      hscaleBounds,
      vscaleBounds,
      verticalMinorTick: verticalIntervalScale,
      horizontalMinorTick: horizontalIntervalScale,
      verticalLine: {
        start: {
          x: vscaleBounds.bottomRight.x,
          y: vscaleBounds.topLeft.y
        },
        end: {
          x: vscaleBounds.bottomRight.x,
          y: vscaleBounds.bottomRight.y
        }
      },
      horizontalLine: {
        start: {
          x: hscaleBounds.topLeft.x,
          y: hscaleBounds.bottomRight.y
        },
        end: {
          x: hscaleBounds.bottomRight.x,
          y: hscaleBounds.bottomRight.y
        }
      }
    }, this.configuration);

    draw(context, (context) => {
      drawScalebars(context, imageAttributes);
    });
  }
}
