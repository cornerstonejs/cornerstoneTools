import external from '../externalModules.js';
import { toolStyle, textStyle } from '../index.js';

/**
 * Create a new context object and set the transform to the
 * {@link https://www.w3.org/TR/2dcontext/#transformations|identity transform}.
 *
 * @param {*} canvas - A <canvas> DOM Element
 * @returns {Object} - An {@link https://www.w3.org/TR/2dcontext/|HTML Canvas 2D Context} object
 *     with identity transform
 */
export function getNewContext (canvas) {
  const context = canvas.getContext('2d');

  context.setTransform(1, 0, 0, 1, 0, 0);

  return context;
}

/**
 * This function manages the {@link https://www.w3.org/TR/2dcontext/#the-canvas-state|save/restore}
 * pattern for working in a new context state stack. The parameter fn is passed the context and can
 * execute any API calls in a clean stack.
 *
 * @param {Object} context - An {@link https://www.w3.org/TR/2dcontext/|HTML Canvas 2D Context} object
 * @param {*} fn - A function which performs drawing operations within the given context.
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
 * @param {Object} context - An {@link https://www.w3.org/TR/2dcontext/|HTML Canvas 2D Context} object
 * @param {*} options
 * @param {*} options.color -  The color (or any other valid
 *     {@link https://www.w3.org/TR/2dcontext/#fill-and-stroke-styles|strokeStyle} of the path.
 * @param {number} options.lineWidth -  The width of lines in the path. If null, no line width is set.
 *     If undefined then toolStyle.getToolWidth() is set.
 * @param {*} options.fillStyle - The {@link https://www.w3.org/TR/2dcontext/#fill-and-stroke-styles|fillStyle}
 *     to fill the path with. If undefined then no filling is done.
 * @param {number[]} options.lineDash - The {@link https://www.w3.org/TR/2dcontext/#line-styles|dash pattern} to use on the lines.
 * @param {*} fn - A drawing function to execute with the provided stroke pattern. Gets passed the context object.
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
 * @param {Object} context - An {@link https://www.w3.org/TR/2dcontext/|HTML Canvas 2D Context} object
 * @param {Object} options
 * @param {boolean} options.shadow - Whether to set any shadow options
 * @param {string} options.shadowColor - Default value: #000000
 * @param {number} options.shadowOffsetX - Default value: 1
 * @param {number} options.shadowOffsetY - Default value: 1
 */
export function setShadow (context, options) {
  if (options.shadow) {
    context.shadowColor = options.shadowColor || '#000000';
    context.shadowOffsetX = options.shadowOffsetX || 1;
    context.shadowOffsetY = options.shadowOffsetY || 1;
  }
}

/**
 * Draw a line between start and end.
 *
 * @param {Object} context - An {@link https://www.w3.org/TR/2dcontext/|HTML Canvas 2D Context} object
 * @param {Object} element - The DOM Element to draw on
 * @param {Object} start - { x, y } in either pixel or canvas coordinates.
 * @param {Object} end - { x, y } in either pixel or canvas coordinates.
 * @param {Object} options - See {@link path}
 * @param {string} [coordSystem='pixel'] - Can be "pixel"(default) or "canvas". The coordinate
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
 * @param {Object} context - An {@link https://www.w3.org/TR/2dcontext/|HTML Canvas 2D Context} object
 * @param {Object} element - The DOM Element to draw on
 * @param {Object[]} lines - [{ start: {x, y}, end: { x, y }] An array of start, end pairs.
 *     Each point is { x, y } in either pixel or canvas coordinates.
 * @param {Object} options - See {@link path}
 * @param {string} [coordSystem='pixel'] - Can be "pixel"(default) or "canvas". The coordinate
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
 * Draw a series of joined lines, starting at start and then going to each point in points.
 *
 * @param {Object} context - An {@link https://www.w3.org/TR/2dcontext/|HTML Canvas 2D Context} object
 * @param {Object} element - The DOM Element to draw on
 * @param {Object} start - { x, y } in either pixel or canvas coordinates.
 * @param {Object[]} points - [{ x, y }] An array of points in either pixel or canvas coordinates.
 * @param {Object} options - See {@link path}
 * @param {string} [coordSystem='pixel'] - Can be "pixel"(default) or "canvas". The coordinate
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
 * Draw a circle with given center and radius.
 *
 * @param {Object} context - An {@link https://www.w3.org/TR/2dcontext/|HTML Canvas 2D Context} object
 * @param {Object} element - The DOM Element to draw on
 * @param {Object} center - { x, y } in either pixel or canvas coordinates.
 * @param {number} radius - The circle's radius in canvas units.
 * @param {Object} options - See {@link path}
 * @param {string} [coordSystem='pixel'] - Can be "pixel"(default) or "canvas". The coordinate
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
 * Draw an ellipse within the bounding box defined by corner1 and corner2.
 *
 * @param {Object} context - An {@link https://www.w3.org/TR/2dcontext/|HTML Canvas 2D Context} object
 * @param {Object} element - The DOM Element to draw on
 * @param {Object} corner1 - { x, y } in either pixel or canvas coordinates.
 * @param {Object} corner2 - { x, y } in either pixel or canvas coordinates.
 * @param {Object} options - See {@link path}
 * @param {string} [coordSystem='pixel'] - Can be "pixel"(default) or "canvas". The coordinate
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
 * Draw a rectangle defined by corner1 and corner2.
 *
 * @param {Object} context - An {@link https://www.w3.org/TR/2dcontext/|HTML Canvas 2D Context} object
 * @param {Object} element - The DOM Element to draw on
 * @param {Object} corner1 - { x, y } in either pixel or canvas coordinates.
 * @param {Object} corner2 - { x, y } in either pixel or canvas coordinates.
 * @param {Object} options - See {@link path}
 * @param {string} [coordSystem='pixel'] - Can be "pixel"(default) or "canvas". The coordinate
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
 * Draw a filled rectangle defined by boundingBox using the style defined by fillStyle.
 *
 * @param {Object} context - An {@link https://www.w3.org/TR/2dcontext/|HTML Canvas 2D Context} object.
 * @param {Object} boundingBox - { left, top, width, height } in canvas coordinates.
 * @param {*} fillStyle - The fillStyle to apply to the region.
 */
export function fillBox (context, boundingBox, fillStyle) {
  context.fillStyle = fillStyle;
  context.fillRect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height);
}

/**
 * Draw multiple lines of text within a bounding box.
 *
 * @param {Object} context - An {@link https://www.w3.org/TR/2dcontext/|HTML Canvas 2D Context} object.
 * @param {Object} boundingBox - { left, top } in canvas coordinates. Only the top-left corner is specified, as the text will take up as much space as it needs.
 * @param {string[]} textLines - The text to be displayed.
 * @param {*} fillStyle - The fillStyle to apply to the text.
 * @param {number} padding - The amount of padding above/below each line in canvas units. Note this gives an inter-line spacing of 2 * padding.
 */
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
