import external from '../externalModules.js';
import { getToolState } from '../stateManagement/toolState.js';
import brushTool from './brushTool.js';
import getCircle from './getCircle.js';
import { drawBrushPixels, drawBrushOnCanvas } from './drawBrush.js';

// This module is for creating segmentation overlays

const TOOL_STATE_TOOL_TYPE = 'brush';
const toolType = 'brush';
const configuration = {
  draw: 1,
  radius: 5,
  minRadius: 1,
  maxRadius: 20,
  hoverColor: 'rgba(230, 25, 75, 1.0)',
  dragColor: 'rgba(230, 25, 75, 0.8)',
  active: false
};

let lastImageCoords;
let dragging = false;

function paint (eventData) {
  const configuration = brush.getConfiguration();
  const element = eventData.element;
  const layer = external.cornerstone.getLayer(element, configuration.brushLayerId);
  const { rows, columns } = layer.image;
  const { x, y } = eventData.currentPoints.image;
  const toolData = getToolState(element, TOOL_STATE_TOOL_TYPE);
  const pixelData = toolData.data[0].pixelData;
  const brushPixelValue = configuration.draw;
  const radius = configuration.radius;

  if (x < 0 || x > columns ||
    y < 0 || y > rows) {
    return;
  }

  const pointerArray = getCircle(radius, rows, columns, x, y);

  drawBrushPixels(pointerArray, pixelData, brushPixelValue, columns);

  layer.invalid = true;

  external.cornerstone.updateImage(element);
}

function onMouseUp (e) {
  const eventData = e.detail;

  lastImageCoords = eventData.currentPoints.image;
  dragging = false;
}

function onMouseDown (e) {
  const eventData = e.detail;

  paint(eventData);
  dragging = true;
  lastImageCoords = eventData.currentPoints.image;
}

function onMouseMove (e) {
  const eventData = e.detail;

  lastImageCoords = eventData.currentPoints.image;
  external.cornerstone.updateImage(eventData.element);
}

function onDrag (e) {
  const eventData = e.detail;

  paint(eventData);
  dragging = true;
  lastImageCoords = eventData.currentPoints.image;
}

function onImageRendered (e) {
  const eventData = e.detail;

  if (!lastImageCoords) {
    return;
  }

  const { rows, columns } = eventData.image;
  const { x, y } = lastImageCoords;

  if (x < 0 || x > columns ||
    y < 0 || y > rows) {
    return;
  }

  // Draw the hover overlay on top of the pixel data
  const configuration = brush.getConfiguration();
  const radius = configuration.radius;
  const context = eventData.canvasContext;
  const color = dragging ? configuration.dragColor : configuration.hoverColor;
  const element = eventData.element;

  context.setTransform(1, 0, 0, 1, 0, 0);

  if (configuration.active) {
    const pointerArray = getCircle(radius, rows, columns, x, y);

    drawBrushOnCanvas(pointerArray, context, color, element);
  }
}

// This method is for fill region of segmentation overlays

function fill (eventData) {
  const configuration = brush.getConfiguration();
  const element = eventData.element;
  const layer = external.cornerstone.getLayer(element, configuration.brushLayerId);
  const { rows, columns } = layer.image;
  let { x, y } = eventData.currentPoints.image;
  const toolData = getToolState(element, TOOL_STATE_TOOL_TYPE);
  const pixelData = toolData.data[0].pixelData;
  const brushPixelValue = configuration.draw;

  const dx = [0, 1, 0, -1];
  const dy = [-1, 0, 1, 0];

  if (x < 0 || x > columns ||
    y < 0 || y > rows) {
    return;
  }

  const getPixelIndex = (x, y) => (y * columns) + x;
  const isSameColor = (x, y, color = brushPixelValue) => pixelData[getPixelIndex(x, y)] === color;
  const draw = (x, y, brushPixelValue) => drawBrushPixels([[x, y]], pixelData, brushPixelValue, columns);
  const drawRange = (range, color) => {
    range.forEach((point) => {
      const spIndex = getPixelIndex(point[0], point[1]);

      pixelData[spIndex] = color;
    });
  };

  x = Math.round(x);
  y = Math.round(y);

  const find = (low, high, condition, base, isY = false) => {
    for (let t = low; low < high ? (t <= high) : (t >= high); t += (low < high ? 1 : -1)) {
      if (isY) {
        if (condition(base, t)) {
          return t;
        }
      } else if (condition(t, base)) {
        return t;
      }
    }

    return null;
  };
  const thisCircle = [
    find(y, 0, (x, y) => !isSameColor(x, y - 1), x, true),
    find(x, columns, (x, y) => !isSameColor(x + 1, y), y, false),
    find(y, rows, (x, y) => !isSameColor(x, y + 1), x, true),
    find(x, 0, (x, y) => !isSameColor(x - 1, y), y, false)
  ];
  let [minDistance, idx, base, low, high] = [2147483647, -1];

  for (let i = 0; i < thisCircle.length; i += 1) {
    let b, l, h;

    if (i % 2) {
      b = y;
      l = find(thisCircle[i] + dx[i], i === 1 ? columns : 0, isSameColor, b, false);
      if (l === null) {
        continue;
      }
      h = find(l + dx[i], i === 1 ? columns : 0, (x, y) => !isSameColor(x + dx[i], y + dy[i]), b, false);
    } else {
      b = x;
      l = find(thisCircle[i] + dy[i], i === 0 ? 0 : rows, isSameColor, b, true);
      if (l === null) {
        continue;
      }
      h = find(l + dy[i], i === 0 ? 0 : rows, (x, y) => !isSameColor(x + dx[i], y + dy[i]), b, true);
    }
    const distance = Math.abs(l - (i % 2 ? x : y));

    if (minDistance > distance) {
      [minDistance, idx, base, low, high] = [distance, i, b, l, h];
    }
  }

  const getPointList = (low, high, base, isY = false) => {
    const ret = [];

    for (let t = low; low < high ? (t <= high) : (t >= high); t += (low < high ? 1 : -1)) {
      ret.push(isY ? [base, t] : [t, base]);
    }

    return ret;
  };

  drawRange(getPointList(low, high, base, !(idx % 2)), 0);

  class Queue {
    constructor () {
      this.store = {};
      this.front = 0;
      this.end = 0;
    }
    enqueue (data) {
      this.store[this.end] = data;
      this.end++;
    }
    dequeue () {
      if (this.front === this.end) {
        return null;
      }
      const data = this.store[this.front];

      delete this.store[this.front];
      this.front++;

      return data;
    }
    size () {
      return this.end - this.front;
    }
  }

  const bfs = (x, y, columns, rows) => {
    let [rx, ry, maxDepth] = [x, y, 0];
    const q = new Queue();
    const d = [];
    let processing = 0;

    q.enqueue({
      x,
      y
    });
    for (let i = 0; i < rows * columns; i += 1) {
      d.push(0);
    }
    d[getPixelIndex(x, y)] = 1;
    while (q.size() !== 0 && processing <= rows * columns) {
      processing += 1;
      const now = q.dequeue();
      const idx = getPixelIndex(now.x, now.y);


      if (maxDepth < d[idx]) {
        [rx, ry, maxDepth] = [now.x, now.y, d[idx]];
      }
      for (let i = 0; i < 4; i += 1) {
        const ny = now.y + dy[i];
        const nx = now.x + dx[i];
        const nidx = getPixelIndex(nx, ny);

        if (ny < 0 || ny >= rows || nx < 0 || nx >= columns || !isSameColor(nx, ny) || d[nidx] !== 0) {
          continue;
        }
        d[nidx] = d[idx] + 1;
        q.enqueue({
          x: nx,
          y: ny
        });
      }
    }

    return {
      x: rx,
      y: ry
    };
  };

  const points = [];

  if (idx % 2) {
    const p1 = bfs(low, base - 1, columns, rows);
    const p2 = bfs(low, base + 1, columns, rows);

    points.push(p1);
    points.push(p2);
  } else {
    const p1 = bfs(base - 1, low, columns, rows);
    const p2 = bfs(base + 1, low, columns, rows);

    points.push(p1);
    points.push(p2);
  }
  drawRange(getPointList(low, high, base, !(idx % 2)), brushPixelValue);
  points.sort((x, y) => x.x - y.x);
  let ttx, tty;

  if (points[0].x === points[1].x) {
    // Gradient is infinity
    drawRange(getPointList(points[0].y, points[1].y, points[0].x, true), brushPixelValue);
  } else {
    const gradient = (points[1].y - points[0].y) / (points[1].x - points[0].x);
    const bias = points[0].y - gradient * points[0].x;
    if ( Math.abs(gradient) >= 1 ) {
      points.sort((x, y) => x.y - y.y);
      for (let ty = points[0].y; ty <= points[1].y; ty += 1) {
        for (let r = -2; r <= 2; r += 1) {
          draw(Math.round((ty - bias) / gradient) + r, ty, brushPixelValue);
        }
      }
    } else {
      for (let tx = points[0].x; tx <= points[1].x; tx += 1) {
        for (let r = -2; r <= 2; r += 1) {
          draw(tx, Math.round(gradient * tx + bias) + r, brushPixelValue);
        }
      }
    }
  }
  // If not point in polygon, return false

  const bfsForFill = (x, y, columns, rows) => {
    const q = new Queue();
    let processing = 0;

    q.enqueue({
      x,
      y
    });
    draw(x, y, brushPixelValue);
    while (q.size() !== 0 && processing <= rows * columns) {
      processing += 1;
      const now = q.dequeue();

      for (let i = 0; i < 4; i += 1) {
        const ny = now.y + dy[i];
        const nx = now.x + dx[i];

        if (ny < 0 || ny >= rows || nx < 0 || nx >= columns || isSameColor(nx, ny, brushPixelValue)) {
          continue;
        }
        q.enqueue({
          x: nx,
          y: ny
        });
        draw(nx, ny, brushPixelValue);
      }
    }
  };
  bfsForFill(x, thisCircle[0] - 1, columns, rows);


  layer.invalid = true;

  external.cornerstone.updateImage(element);
}

function onMouseDoubleClick (e) {
  const eventData = e.detail;

  fill(eventData);
}

const brush = brushTool({
  onMouseMove,
  onMouseDown,
  onMouseUp,
  onDrag,
  toolType,
  onImageRendered,
  onMouseDoubleClick
});

brush.setConfiguration(configuration);

export { brush };
