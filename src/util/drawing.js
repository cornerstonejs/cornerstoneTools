import external from '../externalModules.js';
import { toolStyle, textStyle } from '../index.js';

/**
 * A {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle|color, gradient or pattern} to use inside shapes.
 * @typedef {(String|CanvasGradient|CanvasPattern)} FillStyle
 */

/**
 * A {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle|color, gradient or pattern} to use for the lines around shapes.
 * @typedef {(String|CanvasGradient|CanvasPattern)} StrokeStyle
 */

/**
 * @callback ContextFn
 * @param {CanvasRenderingContext2D} context
 */

/**
 * Create a new {@link CanvasRenderingContext2D|context} object for the given {@link HTMLCanvasElement|canvas}
 * and set the transform to the {@link https://www.w3.org/TR/2dcontext/#transformations|identity transform}.
 *
 * @param {HTMLCanvasElement} canvas
 * @returns {CanvasRenderingContext2D}
 */
export function getNewContext (canvas) {
  const context = canvas.getContext('2d');

  context.setTransform(1, 0, 0, 1, 0, 0);

  return context;
}

/**
 * This function manages the {@link https://www.w3.org/TR/2dcontext/#the-canvas-state|save/restore}
 * pattern for working in a new context state stack. The parameter `fn` is passed the `context` and can
 * execute any API calls in a clean stack.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {ContextFn} fn - A function which performs drawing operations within the given context.
 */
export function draw (context, fn) {
  context.save();
  fn(context);
  context.restore();
}

/**
 * This function manages the beginPath/stroke pattern for working with
 * {@link https://www.w3.org/TR/2dcontext/#drawing-paths-to-the-canvas|path objects}.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {Object} options
 * @param {StrokeStyle} options.color -  The stroke style of the path.
 * @param {Number} options.lineWidth -  The width of lines in the path. If null, no line width is set.
 *     If undefined then toolStyle.getToolWidth() is set.
 * @param {FillStyle} options.fillStyle - The style to fill the path with. If undefined then no filling is done.
 * @param {Number[]} options.lineDash - The {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash|dash pattern}
 *     to use on the lines.
 * @param {ContextFn} fn - A drawing function to execute with the provided stroke pattern.
 */
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

/**
 * Set the {@link https://www.w3.org/TR/2dcontext/#shadows|shadow} properties of the context.
 * Each property is set on the context object if defined, otherwise a default value is set.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {Object} options
 * @param {Boolean} options.shadow - Whether to set any shadow options
 * @param {String} options.shadowColor - Default value: #000000
 * @param {Number} options.shadowOffsetX - Default value: 1
 * @param {Number} options.shadowOffsetY - Default value: 1
 */
export function setShadow (context, options) {
  if (options.shadow) {
    context.shadowColor = options.shadowColor || '#000000';
    context.shadowOffsetX = options.shadowOffsetX || 1;
    context.shadowOffsetY = options.shadowOffsetY || 1;
  }
}

/**
 * Draw a line between `start` and `end`.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {HTMLElement} element - The DOM Element to draw on
 * @param {Object} start - `{ x, y } in either pixel or canvas coordinates.
 * @param {Object} end - `{ x, y }` in either pixel or canvas coordinates.
 * @param {Object} options - See {@link path}
 * @param {String} [coordSystem='pixel'] - Can be "pixel" (default) or "canvas". The coordinate
 *     system of the points passed in to the function. If "pixel" then cornerstone.pixelToCanvas
 *     is used to transform the points from pixel to canvas coordinates.
 */
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

/**
 * Draw multiple lines.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {HTMLElement} element - The DOM Element to draw on
 * @param {Object[]} lines - `[{ start: {x, y}, end: { x, y }]` An array of `start`, `end` pairs.
 *     Each point is `{ x, y }` in either pixel or canvas coordinates.
 * @param {Object} options - See {@link path}
 * @param {String} [coordSystem='pixel'] - Can be "pixel" (default) or "canvas". The coordinate
 *     system of the points passed in to the function. If "pixel" then cornerstone.pixelToCanvas
 *     is used to transform the points from pixel to canvas coordinates.
 */
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

/**
 * Draw a series of joined lines, starting at `start` and then going to each point in `points`.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {HTMLElement} element - The DOM Element to draw on
 * @param {Object} start - `{ x, y }` in either pixel or canvas coordinates.
 * @param {Object[]} points - `[{ x, y }]` An array of points in either pixel or canvas coordinates.
 * @param {Object} options - See {@link path}
 * @param {String} [coordSystem='pixel'] - Can be "pixel" (default) or "canvas". The coordinate
 *     system of the points passed in to the function. If "pixel" then cornerstone.pixelToCanvas
 *     is used to transform the points from pixel to canvas coordinates.
 */
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

/**
 * Draw a circle with given `center` and `radius`.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {HTMLElement} element - The DOM Element to draw on
 * @param {Object} center - `{ x, y }` in either pixel or canvas coordinates.
 * @param {number} radius - The circle's radius in canvas units.
 * @param {Object} options - See {@link path}
 * @param {String} [coordSystem='pixel'] - Can be "pixel" (default) or "canvas". The coordinate
 *     system of the points passed in to the function. If "pixel" then cornerstone.pixelToCanvas
 *     is used to transform the points from pixel to canvas coordinates.
 */
export function drawCircle (context, element, center, radius, options, coordSystem = 'pixel') {
  if (coordSystem === 'pixel') {
    center = external.cornerstone.pixelToCanvas(element, center);
  }

  path(context, options, (context) => {
    context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  });
}

/**
 * Draw an ellipse within the bounding box defined by `corner1` and `corner2`.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {HTMLElement} element - The DOM Element to draw on
 * @param {Object} corner1 - `{ x, y }` in either pixel or canvas coordinates.
 * @param {Object} corner2 - `{ x, y }` in either pixel or canvas coordinates.
 * @param {Object} options - See {@link path}
 * @param {String} [coordSystem='pixel'] - Can be "pixel" (default) or "canvas". The coordinate
 *     system of the points passed in to the function. If "pixel" then cornerstone.pixelToCanvas
 *     is used to transform the points from pixel to canvas coordinates.
 */
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

/**
 * Draw a rectangle defined by `corner1` and `corner2`.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {HTMLElement} element - The DOM Element to draw on
 * @param {Object} corner1 - `{ x, y }` in either pixel or canvas coordinates.
 * @param {Object} corner2 - `{ x, y }` in either pixel or canvas coordinates.
 * @param {Object} options - See {@link path}
 * @param {String} [coordSystem='pixel'] - Can be "pixel" (default) or "canvas". The coordinate
 *     system of the points passed in to the function. If "pixel" then cornerstone.pixelToCanvas
 *     is used to transform the points from pixel to canvas coordinates.
 */
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

/**
 * Fill the region outside a rectangle defined by `corner1` and `corner2`.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {HTMLElement} element - The DOM Element to draw on
 * @param {Object} corner1 - `{ x, y }` in either pixel or canvas coordinates.
 * @param {Object} corner2 - `{ x, y }` in either pixel or canvas coordinates.
 * @param {Object} options - See {@link path}
 * @param {String} [coordSystem='pixel'] - Can be "pixel" (default) or "canvas". The coordinate
 *     system of the points passed in to the function. If "pixel" then cornerstone.pixelToCanvas
 *     is used to transform the points from pixel to canvas coordinates.
 */
export function fillOutsideRect (context, element, corner1, corner2, options, coordSystem = 'pixel') {
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
    context.rect(0, 0, context.canvas.clientWidth, context.canvas.clientHeight);
    context.rect(left + width, top, -width, height);
  });
}


/**
 * Draw a filled rectangle defined by `boundingBox` using the style defined by `fillStyle`.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {Object} boundingBox - `{ left, top, width, height }` in canvas coordinates.
 * @param {FillStyle} fillStyle - The fillStyle to apply to the region.
 */
export function fillBox (context, boundingBox, fillStyle) {
  context.fillStyle = fillStyle;
  context.fillRect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height);
}

/**
 * Draw multiple lines of text within a bounding box.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {Object} boundingBox - `{ left, top }` in canvas coordinates. Only the top-left corner is specified, as the text will take up as much space as it needs.
 * @param {String[]} textLines - The text to be displayed.
 * @param {FillStyle} fillStyle - The fillStyle to apply to the text.
 * @param {Number} padding - The amount of padding above/below each line in canvas units. Note this gives an inter-line spacing of `2*padding`.
 */
export function fillTextLines (context, boundingBox, textLines, fillStyle, padding) {
  const fontSize = textStyle.getFontSize();

  context.font = textStyle.getFont();
  context.textBaseline = 'top';
  context.fillStyle = fillStyle;
  textLines.forEach(function (text, index) {
    context.fillText(text, boundingBox.left + padding, boundingBox.top + padding + index * (fontSize + padding));
  });
}
