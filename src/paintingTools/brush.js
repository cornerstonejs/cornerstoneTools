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
  const isSameColor = (x, y) => pixelData[getPixelIndex(x, y)] === brushPixelValue;
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
  let [minDistance, idx, _base, _low, _high] = [2147483647, -1];

  for (let i = 0; i < thisCircle.length; i += 1) {
    let _b, _l, _h; 
    if (i & 1) {
      _b = y;
      _l = find(thisCircle[i] + dx[i], i === 1 ? columns : 0, isSameColor, _b, false);
      if (_l === null) {
        continue;
      }
      _h = find(_l + dx[i], i === 1 ? columns : 0, (x, y) => !isSameColor(x + dx[i], y + dy[i]), _b, false);
    } else {
      _b = x;
      _l = find(thisCircle[i] + dy[i], i === 0 ? 0 : rows, isSameColor, _b, true);
      if (_l === null) {
        continue;
      }
      _h = find(_l + dy[i], i === 0 ? 0 : rows, (x, y) => !isSameColor(x + dx[i], y + dy[i]), _b, true);
    }
    const distance = Math.abs(_l - (i & 1 ? x : y));
    if (minDistance > distance) {
      [minDistance, idx, _base, _low, _high] = [distance, i, _b, _l, _h];
    }
  }

  const getPointList = (low, high, base, isY = false) => {
    const ret = [];

    for (let t = low; low < high ? (t <= high) : (t >= high); t += (low < high ? 1 : -1)) {
      ret.push(isY ? [base, t] : [t, base]);
    }

    return ret;
  };

  drawRange(getPointList(_low, _high, _base, !(idx & 1)), 0);

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

    return [rx, ry, maxDepth];
  };

  let [lx, ly, hx, hy] = [-1, -1, -1, -1];
  if (idx & 1) {
    [lx, ly] = bfs(_low, _base - 1, columns, rows);
    [hx, hy] = bfs(_low, _base + 1, columns, rows);
    draw(lx, ly, 4);
    draw(hx, hy, 4);
  } else {
    [lx, ly] = bfs(_base - 1, _low, columns, rows);
    [hx, hy] = bfs(_base + 1, _low, columns, rows);
    draw(lx, ly, 4);
    draw(hx, hy, 4);
  }

  drawRange(getPointList(_low, _high, _base, !(idx & 1)), brushPixelValue);

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
