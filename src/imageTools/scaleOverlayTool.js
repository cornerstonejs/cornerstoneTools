import displayTool from './displayTool.js';
import EVENTS from '../events.js';
import external from '../externalModules.js';
import { getNewContext, draw, drawLines, drawLine } from '../util/drawing.js';

const configuration = {
  color: 'white',
  lineWidth: 2,
  shadowColor: 'black',
  shadowBlur: 4
};

function drawVerticalScalebarIntervals (imageAttributes) {
  let i = 0;
  const lines = [];

  while (imageAttributes.verticalLine.start.y + i * imageAttributes.verticalMinorTick <= imageAttributes.vscaleBounds.bottomRight.y) {

    const start = {
      x: imageAttributes.verticalLine.start.x,
      y: imageAttributes.verticalLine.start.y + i * imageAttributes.verticalMinorTick
    };

    const end = {
      x: 0,
      y: imageAttributes.verticalLine.start.y + i * imageAttributes.verticalMinorTick
    };

    if (i % 5 === 0) {

      end.x = imageAttributes.verticalLine.start.x - imageAttributes.majorTickLength;
    } else {

      end.x = imageAttributes.verticalLine.start.x - imageAttributes.minorTickLength;
    }

    lines.push({
      start,
      end
    });
    i++;
  }

  return lines;
}

function drawHorizontalScalebarIntervals (imageAttributes) {
  let i = 0;
  const lines = [];

  while (imageAttributes.horizontalLine.start.x + i * imageAttributes.horizontalMinorTick <= imageAttributes.hscaleBounds.bottomRight.x) {

    const start = {
      x: imageAttributes.horizontalLine.start.x + i * imageAttributes.horizontalMinorTick,
      y: imageAttributes.horizontalLine.start.y
    };

    const end = {
      x: imageAttributes.horizontalLine.start.x + i * imageAttributes.horizontalMinorTick,
      y: 0
    };

    if (i % 5 === 0) {
      end.y = imageAttributes.horizontalLine.start.y - imageAttributes.majorTickLength;
    } else {
      end.y = imageAttributes.horizontalLine.start.y - imageAttributes.minorTickLength;
    }

    lines.push({
      start,
      end
    });
    i++;
  }

  return lines;
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

  const context = getNewContext(eventData.canvasContext.canvas);
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

  const { color, lineWidth } = imageAttributes;
  const options = {
    color,
    lineWidth
  };
  const vertLines = drawVerticalScalebarIntervals(imageAttributes);
  const horizLines = drawHorizontalScalebarIntervals(imageAttributes);

  draw(context, (context) => {
    context.shadowColor = imageAttributes.shadowColor;
    context.shadowBlur = imageAttributes.shadowBlur;

    drawLine(context, undefined, imageAttributes.verticalLine.start, imageAttributes.verticalLine.end, options, 'canvas');
    drawLine(context, undefined, imageAttributes.horizontalLine.start, imageAttributes.horizontalLine.end, options, 'canvas');

    drawLines(context, undefined, vertLines, options, 'canvas');
    drawLines(context, undefined, horizLines, options, 'canvas');
  });
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
