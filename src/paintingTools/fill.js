import { drawBrushPixels } from './drawBrush.js';
import { Queue } from './queue.js';

function find (low, high, condition, base, isY = false) {
  for (let t = low; low < high ? (t <= high) : (t >= high); t += (low < high ? 1 : -1)) {
    if (isY && condition(base, t)) {
      return t;
    } else if (!isY && condition(t, base)) {
      return t;
    }
  }

  return null;
}

function isSameColor (pixelIndex, pixelData, color) {
  return pixelData[pixelIndex] === color;
}

function getEndOfCircle (x, y, columns, rows, pixelData, brushPixelValue) {
  const getPixelIndex = (x, y) => (y * columns) + x;

  return [
    find(y, 0, (x, y) => !isSameColor(getPixelIndex(x, y - 1), pixelData, brushPixelValue), x, true),
    find(x, columns, (x, y) => !isSameColor(getPixelIndex(x + 1, y), pixelData, brushPixelValue), y, false),
    find(y, rows, (x, y) => !isSameColor(getPixelIndex(x, y + 1), pixelData, brushPixelValue), x, true),
    find(x, 0, (x, y) => !isSameColor(getPixelIndex(x - 1, y), pixelData, brushPixelValue), y, false)
  ];
}

function findTheClosestDirection (x, y, columns, rows, thisCircle, pixelData, brushPixelValue) {
  // Find a direction the closest point where same color from (x, y)
  const dx = [0, 1, 0, -1];
  const dy = [-1, 0, 1, 0];
  let minDistance = Number.MAX_SAFE_INTEGER;
  let idx = -1;
  let base, low, high;
  const getPixelIndex = (x, y) => (y * columns) + x;

  for (let i = 0; i < thisCircle.length; i++) {
    let b, l, h; // Base, low, high;

    if (i % 2) {
      b = y;
      l = find(thisCircle[i] + dx[i], i === 1 ? columns : 0, (x, y) => isSameColor(getPixelIndex(x, y), pixelData, brushPixelValue), b, false);
      if (l === null) {
        continue;
      }
      h = find(l + dx[i], i === 1 ? columns : 0, (x, y) => !isSameColor(getPixelIndex(x + dx[i], y + dy[i]), pixelData, brushPixelValue), b, false);
    } else {
      b = x;
      l = find(thisCircle[i] + dy[i], i === 0 ? 0 : rows, (x, y) => isSameColor(getPixelIndex(x, y), pixelData, brushPixelValue), b, true);
      if (l === null) {
        continue;
      }
      h = find(l + dy[i], i === 0 ? 0 : rows, (x, y) => !isSameColor(getPixelIndex(x + dx[i], y + dy[i]), pixelData, brushPixelValue), b, true);
    }
    const distance = Math.abs(l - (i % 2 ? x : y));

    if (minDistance > distance) {
      [minDistance, idx, base, low, high] = [distance, i, b, l, h];
    }
  }
  if (minDistance === Number.MAX_SAFE_INTEGER) {
    return [null, null, null, null];
  }

  return [idx, base, low, high];
}

function getTheFarthestPointInSameColor (x, y, columns, rows, pixelData, color) {
  let [rx, ry, maxDepth] = [x, y, 0];
  const q = new Queue();
  const d = [];
  const dx = [0, 1, 0, -1];
  const dy = [-1, 0, 1, 0];
  let processing = 0;

  const getPixelIndex = (x, y) => (y * columns) + x;

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

      if (ny < 0 || ny >= rows || nx < 0 || nx >= columns) {
        continue;
      }
      if (!isSameColor(nidx, pixelData, color) || d[nidx] !== 0) {
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
}

function getPointListInRange (low, high, base, isY = false) {
  const ret = [];

  for (let t = low; low < high ? (t <= high) : (t >= high); t += (low < high ? 1 : -1)) {
    ret.push(isY ? [base, t] : [t, base]);
  }

  return ret;
}

function connectEndsOfBrush (x, y, columns, rows, thisCircle, pixelData, brushPixelValue) {
  const draw = (x, y, brushPixelValue) => drawBrushPixels([[x, y]], pixelData, brushPixelValue, columns);
  const drawRange = (range, color) => drawBrushPixels(range, pixelData, color, columns);
  const [direction, base, low, high] = findTheClosestDirection(x, y, columns, rows, thisCircle, pixelData, brushPixelValue);
  const points = [];

  if (direction === null) {
    return false;
  }
  drawRange(getPointListInRange(low, high, base, !(direction % 2)), 0);
  if (direction % 2) {
    const p1 = getTheFarthestPointInSameColor(low, base - 1, columns, rows, pixelData, brushPixelValue);
    const p2 = getTheFarthestPointInSameColor(low, base + 1, columns, rows, pixelData, brushPixelValue);

    points.push(p1);
    points.push(p2);
  } else {
    const p1 = getTheFarthestPointInSameColor(base - 1, low, columns, rows, pixelData, brushPixelValue);
    const p2 = getTheFarthestPointInSameColor(base + 1, low, columns, rows, pixelData, brushPixelValue);

    points.push(p1);
    points.push(p2);
  }
  drawRange(getPointListInRange(low, high, base, !(direction % 2)), brushPixelValue);

  points.sort((x, y) => x.x - y.x);
  if (points[0].x === points[1].x) {
    // Gradient is infinity
    drawRange(getPointListInRange(points[0].y, points[1].y, points[0].x, true), brushPixelValue);
  } else {
    const gradient = (points[1].y - points[0].y) / (points[1].x - points[0].x);
    const bias = points[0].y - gradient * points[0].x;
    const lineWidth = 1;

    if (Math.abs(gradient) >= 1) {
      points.sort((x, y) => x.y - y.y);
      for (let ty = points[0].y; ty <= points[1].y; ty += 1) {
        for (let r = -(lineWidth - 1); r <= (lineWidth + 1); r += 1) {
          draw(Math.round((ty - bias) / gradient) + r, ty, brushPixelValue);
        }
      }
    } else {
      for (let tx = points[0].x; tx <= points[1].x; tx += 1) {
        for (let r = -(lineWidth - 1); r <= (lineWidth + 1); r += 1) {
          draw(tx, Math.round(gradient * tx + bias) + r, brushPixelValue);
        }
      }
    }
  }

  return true;
}

function isCircleInPolygon (x, y, columns, rows, thisCircle, pixelData, brushPixelValue) {
  const getPixelIndex = (x, y) => (y * columns) + x;
  const left = find(thisCircle[3] - 1, 0, (x, y) => isSameColor(getPixelIndex(x, y), pixelData, brushPixelValue), y, false);
  const right = find(thisCircle[1] + 1, columns, (x, y) => isSameColor(getPixelIndex(x, y), pixelData, brushPixelValue), y, false);

  return left && right;
}

function fillColor (x, y, columns, rows, pixelData, brushPixelValue) {
  const q = new Queue();
  const dx = [0, 1, 0, -1];
  const dy = [-1, 0, 1, 0];
  let processing = 0;
  const getPixelIndex = (x, y) => (y * columns) + x;
  const draw = (x, y, brushPixelValue) => drawBrushPixels([[x, y]], pixelData, brushPixelValue, columns);

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

      if (ny < 0 || ny >= rows || nx < 0 || nx >= columns || isSameColor(getPixelIndex(nx, ny), pixelData, brushPixelValue)) {
        continue;
      }
      q.enqueue({
        x: nx,
        y: ny
      });
      draw(nx, ny, brushPixelValue);
    }
  }
}

export { getEndOfCircle, connectEndsOfBrush, isCircleInPolygon, fillColor };
