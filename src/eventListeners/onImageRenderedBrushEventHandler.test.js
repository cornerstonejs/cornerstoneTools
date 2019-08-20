import * as onImageRenderedBrushEventHandler from './onImageRenderedBrushEventHandler.js';
import external from '../externalModules.js';

jest.mock('../externalModules', () => ({
  cornerstone: {
    pixelToCanvas: (element, imageCoord) => {
      // Mock some transformation.
      const { viewport, canvas } = mockGetEnabledElement(element);

      const m = [1, 0, 0, 1, 0, 0];

      function translate(x, y) {
        m[4] += m[0] * x + m[2] * y;
        m[5] += m[1] * x + m[3] * y;
      }

      function rotate(rad) {
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        const m11 = m[0] * c + m[2] * s;
        const m12 = m[1] * c + m[3] * s;
        const m21 = m[0] * -s + m[2] * c;
        const m22 = m[1] * -s + m[3] * c;

        m[0] = m11;
        m[1] = m12;
        m[2] = m21;
        m[3] = m22;
      }

      function scale(sx, sy) {
        m[0] *= sx;
        m[1] *= sx;
        m[2] *= sy;
        m[3] *= sy;
      }

      // Move to center of canvas
      translate(canvas.width / 2, canvas.height / 2);

      // Apply the rotation before scaling
      const angle = viewport.rotation;

      if (angle !== 0) {
        rotate((angle * Math.PI) / 180);
      }

      // Apply the scale
      const widthScale = viewport.scale;
      const heightScale = viewport.scale;

      const width =
        viewport.displayedArea.brhc.x - (viewport.displayedArea.tlhc.x - 1);
      const height =
        viewport.displayedArea.brhc.y - (viewport.displayedArea.tlhc.y - 1);

      scale(widthScale, heightScale);

      // Unrotate to so we can translate unrotated
      if (angle !== 0) {
        rotate((-angle * Math.PI) / 180);
      }

      // Apply the pan offset
      translate(viewport.translation.x, viewport.translation.y);

      // Rotate again
      if (angle !== 0) {
        rotate((angle * Math.PI) / 180);
      }

      // Apply Flip if required
      if (viewport.hflip) {
        scale(-1, 1);
      }

      if (viewport.vflip) {
        scale(1, -1);
      }

      // Move back from center of image
      translate(-width / 2, -height / 2);

      const x = imageCoord.x;
      const y = imageCoord.y;

      const px = x * m[0] + y * m[2] + m[4];
      const py = x * m[1] + y * m[3] + m[5];

      return {
        x: px,
        y: py,
      };
    },
  },
}));

let eventData;
let labelmap3D;
let labelmap2D;
let lineWidth;

const mockGetEnabledElement = element => ({
  element,
  viewport: eventData.viewport,
  image: eventData.image,
  canvas: eventData.canvasContext.canvas,
});

function resetEvents() {
  const width = 256;
  const length = width * width;
  const currentImageIdIndex = 0;

  const canvasScale = 1.0;

  lineWidth = 1;

  eventData = {
    element: null,
    image: {
      width: 256,
      height: 256,
    },
    viewport: {
      rotation: 0,
      scale: canvasScale,
      translation: { x: 0, y: 0 },
      hflip: false,
      vflip: false,
      displayedArea: {
        brhc: { x: 256, y: 256 },
        tlhc: { x: 1, y: 1 },
      },
    },
    canvasContext: {
      canvas: {
        width: canvasScale * width,
        height: canvasScale * width,
      },
    },
  };

  labelmap3D = {
    buffer: new ArrayBuffer(length * 2),
    labelmaps2D: [],
    metadata: [],
    activeSegmentIndex: 0,
    segmentsVisible: [],
  };

  labelmap2D = {
    pixelData: new Uint16Array(labelmap3D.buffer, 0, length),
    segmentsOnLabelmap: [0, 1, 2],
    invalidated: true,
  };

  const pixelData = labelmap2D.pixelData;
  const cols = eventData.image.width;

  // Add segment 1 as an L shape, so should have 1 interior corner.
  pixelData[64 * cols + 64] = 1;
  pixelData[65 * cols + 64] = 1;
  pixelData[65 * cols + 65] = 1;

  // Add segment 2 as a rectangle.
  for (let x = 201; x <= 210; x++) {
    pixelData[200 * cols + x] = 2;
    pixelData[201 * cols + x] = 2;
  }

  labelmap3D.labelmaps2D[currentImageIdIndex] = labelmap2D;
}

function setCanvasTransform(options = {}) {
  const viewport = eventData.viewport;

  if (options.scale) {
    const { scale } = options;
    const { width, height } = eventData.image;

    eventData.viewport.scale = scale;

    eventData.canvasContext.canvas = {
      width: scale * width,
      height: scale * height,
    };
  }

  if (options.rotation) {
    viewport.rotation = options.rotation;
  }

  if (options.translation) {
    viewport.translation = options.translation;
  }

  if (options.hflip) {
    viewport.hflip = options.hflip;
  }

  if (options.vflip) {
    viewport.vflip = options.vflip;
  }
}

describe('onImageRenderedBrushEventHandler.js', () => {
  beforeEach(() => {
    resetEvents();
  });

  describe('Initialization', () => {
    it('should have a test image of 256 x 256 pixels.', () => {
      const { width, height } = eventData.image;

      expect(width * height).toBe(65536);
    });

    it('should map point 100,100 in image to 100,100 on canvas.', () => {
      const canvasPoint = external.cornerstone.pixelToCanvas(
        eventData.element,
        { x: 100, y: 100 }
      );

      expect(canvasPoint.x).toBe(100);
      expect(canvasPoint.y).toBe(100);
    });

    it('should map point 0,0 in image to 256,0 on canvas.', () => {
      setCanvasTransform({
        rotation: 90,
      });

      const canvasPoint = external.cornerstone.pixelToCanvas(
        eventData.element,
        { x: 0, y: 0 }
      );

      expect(canvasPoint.x).toBe(256);
      expect(canvasPoint.y).toBe(0);
    });
  });

  describe('_getLineSegments', () => {
    it('Should produce two segment outlines with 9 and 24 lines.', () => {
      const lineSegments = onImageRenderedBrushEventHandler._getLineSegments(
        eventData,
        labelmap3D,
        labelmap2D,
        lineWidth
      );

      expect(lineSegments[1].length).toBe(9);
      expect(lineSegments[2].length).toBe(24);
    });

    it('Should correctly rotate the line segments to the canvas (90 degrees)', () => {
      setCanvasTransform({
        rotation: 90,
      });

      const lineSegments = onImageRenderedBrushEventHandler._getLineSegments(
        eventData,
        labelmap3D,
        labelmap2D,
        lineWidth
      );

      const { start, end } = lineSegments[1][0];

      // First horizontal line now vertical
      //
      // start = { x: 191.5, y: 64 }
      // end = { x: 191.5, y: 65 }

      expect(start.x).toBeCloseTo(191.5);
      expect(start.y).toBeCloseTo(64);
      expect(end.x).toBeCloseTo(191.5);
      expect(end.y).toBeCloseTo(65);
    });

    it('Should correctly horizontally flip the line segments to the canvas', () => {
      setCanvasTransform({
        hflip: true,
      });

      const lineSegments = onImageRenderedBrushEventHandler._getLineSegments(
        eventData,
        labelmap3D,
        labelmap2D,
        lineWidth
      );

      const { start, end } = lineSegments[1][0];

      // First horizontal line now flipped:
      //
      // start: { x: 192, y: 64.5 }
      // end: { x: 191, y: 64.5 }

      expect(start.x).toBeCloseTo(192);
      expect(start.y).toBeCloseTo(64.5);
      expect(end.x).toBeCloseTo(191);
      expect(end.y).toBeCloseTo(64.5);
    });

    it('Should correctly vertically flip the line segments to the canvas', () => {
      setCanvasTransform({
        vflip: true,
      });

      const lineSegments = onImageRenderedBrushEventHandler._getLineSegments(
        eventData,
        labelmap3D,
        labelmap2D,
        lineWidth
      );

      const { start, end } = lineSegments[1][0];

      // First horizontal line now flipped:
      //
      // start: { x: 192, y: 64.5 }
      // end: { x: 191, y: 64.5 }

      // TODO - Fix horrizontal and vertical flips!
      // By pushing the line slightly inwards.

      expect(start.x).toBeCloseTo(191.5);
      expect(start.y).toBeCloseTo(64);
      expect(end.x).toBeCloseTo(191.5);
      expect(end.y).toBeCloseTo(65);
    });
  });
});
