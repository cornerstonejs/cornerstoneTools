import displayTool from './displayTool.js';
import EVENTS from '../events.js';
import external from '../externalModules.js';

const configuration = {
  color: 'white',
  lineWidth: 2,
  shadowColor: 'black',
  shadowBlur: 4
};

function drawLine (context, startPoint, endPoint) {
  context.moveTo(startPoint.x, startPoint.y);
  context.lineTo(endPoint.x, endPoint.y);
}

function drawVerticalScalebarIntervals (context, imageAttributes) {
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
}

function drawHorizontalScalebarIntervals (context, imageAttributes) {
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
}

function drawVerticalScalebar (context, imageAttributes) {
  const startPoint = {
    x: imageAttributes.verticalLine.start.x,
    y: imageAttributes.verticalLine.start.y
  };
  const endPoint = {
    x: imageAttributes.verticalLine.end.x,
    y: imageAttributes.verticalLine.end.y
  };

  context.beginPath();
  context.strokeStyle = imageAttributes.color;
  context.lineWidth = imageAttributes.lineWidth;

  drawLine(context, startPoint, endPoint);
  drawVerticalScalebarIntervals(context, imageAttributes);

  context.stroke();
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

function drawScalebars (context, imageAttributes) {
  context.shadowColor = imageAttributes.shadowColor;
  context.shadowBlur = imageAttributes.shadowBlur;
  context.strokeStyle = imageAttributes.color;
  context.lineWidth = imageAttributes.lineWidth;

  context.beginPath();
  drawVerticalScalebar(context, imageAttributes);
  drawHorizontalScalebar(context, imageAttributes);
  context.stroke();
}

// Computes the max bound for scales on the image
function computeScaleBounds (eventData, canvasSize, imageSize, horizontalReduction, verticalReduction) {

  let canvasBounds = {
    left: 0,
    top: 0,
    width: canvasSize.width,
    height: canvasSize.height
  };

  const hReduction = horizontalReduction * Math.min(1000, canvasSize.width);
  const vReduction = verticalReduction * Math.min(1000, canvasSize.height);

  canvasBounds = {
    left: canvasBounds.left + hReduction,
    top: canvasBounds.top + vReduction,
    width: canvasBounds.width - 2 * hReduction,
    height: canvasBounds.height - 2 * vReduction
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
}

// /////// BEGIN IMAGE RENDERING ///////
function onImageRendered (e) {
  const eventData = e.detail;

  const context = eventData.canvasContext.canvas.getContext('2d');
  const { image, viewport } = eventData;
  const cornerstone = external.cornerstone;

  const imagePlane = cornerstone.metaData.get('imagePlaneModule', image.imageId);
  let rowPixelSpacing;
  let colPixelSpacing;

  if (imagePlane) {
    rowPixelSpacing = imagePlane.rowPixelSpacing || imagePlane.rowImagePixelSpacing;
    colPixelSpacing = imagePlane.columnPixelSpacing || imagePlane.colImagePixelSpacing;
  } else {
    rowPixelSpacing = image.rowPixelSpacing;
    colPixelSpacing = image.columnPixelSpacing;
  }

  // Check whether pixel spacing is defined
  if (!rowPixelSpacing || !colPixelSpacing) {
    return;
  }

  const canvasSize = {
    width: context.canvas.width,
    height: context.canvas.height
  };
  const imageSize = {
    width: image.width,
    height: image.height
  };

  // Distance between intervals is 10mm
  const verticalIntervalScale = (10.0 / rowPixelSpacing) * viewport.scale;
  const horizontalIntervalScale = (10.0 / colPixelSpacing) * viewport.scale;

  // 0.1 and 0.05 gives margin to horizontal and vertical lines
  const hscaleBounds = computeScaleBounds(eventData, canvasSize, imageSize, 0.25, 0.05);
  const vscaleBounds = computeScaleBounds(eventData, canvasSize, imageSize, 0.05, 0.15);

  if (!canvasSize.width || !canvasSize.height || !imageSize.width || !imageSize.height || !hscaleBounds || !vscaleBounds) {
    return;
  }

  const configuration = scaleOverlayTool.getConfiguration();
  const imageAttributes = Object.assign({}, {
    hscaleBounds,
    vscaleBounds,
    verticalMinorTick: verticalIntervalScale,
    horizontalMinorTick: horizontalIntervalScale,
    minorTickLength: 12.5,
    majorTickLength: 25,
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
  }, configuration);

  context.setTransform(1, 0, 0, 1, 0, 0);
  context.save();

  drawScalebars(context, imageAttributes);
  context.restore();
}
// /////// END IMAGE RENDERING ///////

function disable (element) {
  // TODO: displayTool does not have cornerstone.updateImage(element) method to hide tool
  element.removeEventListener(EVENTS.IMAGE_RENDERED, onImageRendered);
  external.cornerstone.updateImage(element);
}

// Module exports
const scaleOverlayTool = displayTool(onImageRendered);

scaleOverlayTool.setConfiguration(configuration);

scaleOverlayTool.disable = disable;

export default scaleOverlayTool;
