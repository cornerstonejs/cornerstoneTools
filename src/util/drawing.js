import external from '../externalModules.js';
import { toolStyle, textStyle } from '../index.js';

export function getNewContext (canvas) {
  // Return a new "HTML Canvas 2D Context"
  // https://www.w3.org/TR/2dcontext/
  const context = canvas.getContext('2d');

  // Set the context transform to the identity matrix.
  // https://www.w3.org/TR/2dcontext/#transformations
  context.setTransform(1, 0, 0, 1, 0, 0);

  return context;
}

export function draw (context, fn) {
  // Perform canvas drawing operations on a new state-stack of context
  // https://www.w3.org/TR/2dcontext/#the-canvas-state
  context.save();
  fn(context);
  context.restore();
}

export function path (context, options, fn) {

  const { color, lineWidth, fillStyle, lineDash } = options;

  context.beginPath();
  context.strokeStyle = color || context.strokeStyle;
  context.lineWidth = lineWidth || (lineWidth === undefined && toolStyle.getToolWidth()) || context.lineWidth;
  if (lineDash) {
    context.setLineDash(lineDash);
  }

  fn(context);

  if (fillStyle) {
    context.fillStyle = fillStyle;
    context.fill();
  }
  context.stroke();
  if (lineDash) {
    context.setLineDash([]);
  }
}

export function setShadow (context, options) {
  if (options.shadow) {
    context.shadowColor = options.shadowColor || '#000000';
    context.shadowOffsetX = options.shadowOffsetX || 1;
    context.shadowOffsetY = options.shadowOffsetY || 1;
  }
}

export function drawLine (context, element, start, end, options, coordSystem = 'pixel') {
  path(context, options, (context) => {
    if (coordSystem === 'pixel') {
      const cornerstone = external.cornerstone;

      start = cornerstone.pixelToCanvas(element, start);
      end = cornerstone.pixelToCanvas(element, end);
    }

    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
  });
}

export function drawLines (context, element, lines, options, coordSystem = 'pixel') {
  path(context, options, (context) => {
    lines.forEach((line) => {
      let start = line.start;
      let end = line.end;

      if (coordSystem === 'pixel') {
        const cornerstone = external.cornerstone;

        start = cornerstone.pixelToCanvas(element, start);
        end = cornerstone.pixelToCanvas(element, end);
      }

      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
    });
  });
}

export function drawJoinedLines (context, element, start, points, options, coordSystem = 'pixel') {
  path(context, options, (context) => {
    if (coordSystem === 'pixel') {
      const cornerstone = external.cornerstone;

      start = cornerstone.pixelToCanvas(element, start);
      points = points.map((p) => cornerstone.pixelToCanvas(element, p));
    }
    context.moveTo(start.x, start.y);
    points.forEach(({ x, y }) => {
      context.lineTo(x, y);
    });
  });
}

export function drawCircle (context, element, center, radius, options, coordSystem = 'pixel') {
  if (coordSystem === 'pixel') {
    center = external.cornerstone.pixelToCanvas(element, center);
  }

  path(context, options, (context) => {
    context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  });
}

export function drawEllipse (context, element, corner1, corner2, options, coordSystem = 'pixel') {
  // http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
  if (coordSystem === 'pixel') {
    corner1 = external.cornerstone.pixelToCanvas(element, corner1);
    corner2 = external.cornerstone.pixelToCanvas(element, corner2);
  }
  const x = Math.min(corner1.x, corner2.x);
  const y = Math.min(corner1.y, corner2.y);
  const w = Math.abs(corner1.x - corner2.x);
  const h = Math.abs(corner1.y - corner2.y);

  const kappa = 0.5522848,
    ox = (w / 2) * kappa, // Control point offset horizontal
    oy = (h / 2) * kappa, // Control point offset vertical
    xe = x + w, // X-end
    ye = y + h, // Y-end
    xm = x + w / 2, // X-middle
    ym = y + h / 2; // Y-middle

  path(context, options, (context) => {
    context.moveTo(x, ym);
    context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    context.closePath();
  });
}

export function drawRect (context, element, corner1, corner2, options, coordSystem = 'pixel') {
  if (coordSystem === 'pixel') {
    const cornerstone = external.cornerstone;

    corner1 = cornerstone.pixelToCanvas(element, corner1);
    corner2 = cornerstone.pixelToCanvas(element, corner2);
  }

  const left = Math.min(corner1.x, corner2.x);
  const top = Math.min(corner1.y, corner2.y);
  const width = Math.abs(corner1.x - corner2.x);
  const height = Math.abs(corner1.y - corner2.y);

  path(context, options, (context) => {
    context.rect(left, top, width, height);
  });
}

export function fillBox (context, boundingBox, fillStyle) {
  context.fillStyle = fillStyle;
  context.fillRect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height);
}

export function fillTextLines (context, boundingBox, textLines, fillStyle, padding) {
  // Draw each of the text lines on top of the background box
  const fontSize = textStyle.getFontSize();

  context.font = textStyle.getFont();
  context.textBaseline = 'top';
  context.fillStyle = fillStyle;
  textLines.forEach(function (text, index) {
    context.fillText(text, boundingBox.left + padding, boundingBox.top + padding + index * (fontSize + padding));
  });
}
