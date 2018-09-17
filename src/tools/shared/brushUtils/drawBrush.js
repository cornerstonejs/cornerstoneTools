import external from '../../../externalModules.js';
import { draw, fillBox } from '../../../util/drawing.js';

function drawBrushPixels (pointerArray, storedPixels, brushPixelValue, columns, shouldErase = false) {
  const getPixelIndex = (x, y) => (y * columns) + x;

  pointerArray.forEach((point) => {
    const spIndex = getPixelIndex(point[0], point[1]);

    storedPixels[spIndex] = shouldErase ? 0 : 1;
  });
}

function drawBrushOnCanvas (pointerArray, context, color, element) {
  const canvasPtTL = external.cornerstone.pixelToCanvas(element, { x: 0,
    y: 0 });
  const canvasPtBR = external.cornerstone.pixelToCanvas(element, { x: 1,
    y: 1 });
  const sizeX = canvasPtBR.x - canvasPtTL.x;
  const sizeY = canvasPtBR.y - canvasPtTL.y;

  draw(context, (context) => {
    pointerArray.forEach((point) => {
      const canvasPt = external.cornerstone.pixelToCanvas(element, {
        x: point[0],
        y: point[1]
      });
      const boundingBox = {
        left: canvasPt.x,
        top: canvasPt.y,
        width: sizeX,
        height: sizeY
      };

      fillBox(context, boundingBox, color);
    });
  });
}

export { drawBrushPixels, drawBrushOnCanvas };
