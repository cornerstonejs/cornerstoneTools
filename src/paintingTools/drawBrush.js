import external from '../externalModules.js';

function drawBrushPixels (pointerArray, storedPixels, brushPixelValue, columns) {
  const getPixelIndex = (x, y) => (y * columns) + x;

  pointerArray.forEach((point) => {
    const spIndex = getPixelIndex(point[0], point[1]);

    storedPixels[spIndex] = brushPixelValue;
  });
}

function drawBrushOnCanvas (pointerArray, canvasContext, color, element) {
  const canvasPtTL = external.cornerstone.pixelToCanvas(element, { x: 0,
    y: 0 });
  const canvasPtBR = external.cornerstone.pixelToCanvas(element, { x: 1,
    y: 1 });
  const sizeX = canvasPtBR.x - canvasPtTL.x;
  const sizeY = canvasPtBR.y - canvasPtTL.y;

  canvasContext.save();
  canvasContext.fillStyle = color;

  pointerArray.forEach((point) => {
    const canvasPt = external.cornerstone.pixelToCanvas(element, {
      x: point[0],
      y: point[1]
    });

    canvasContext.fillRect(canvasPt.x, canvasPt.y, sizeX, sizeY);
  });

  canvasContext.restore();
}

export { drawBrushPixels, drawBrushOnCanvas };
