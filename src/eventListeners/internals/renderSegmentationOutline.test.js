import { getModule } from '../../store/index.js';
import { getOutline, renderOutline } from './renderSegmentationOutline.js';
import external from '../../externalModules.js';
import * as drawing from '../../drawing/index.js';

const { state } = getModule('segmentation');

jest.mock('../../drawing/index.js', () => {
  const getNewContextMock = {
    globalAlpha: 1.0,
    setTransform: jest.fn(),
  };

  return {
    getNewContext: jest.fn(() => getNewContextMock),
    draw: (context, callback) => {
      callback(context);
    },
    drawLines: jest.fn(),
    drawJoinedLines: jest.fn(),
  };
});

jest.mock('../../externalModules', () => ({
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
let evt;
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

  const canvasTransformState = {
    a: 0.078,
    b: 0,
    c: 0,
    d: 0.078,
    e: 52.9,
    f: 0,
  };

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
      getTransform: jest.fn(() => canvasTransformState),
    },
  };

  evt = {
    detail: eventData,
  };

  labelmap3D = {
    buffer: new ArrayBuffer(length * 2),
    labelmaps2D: [],
    metadata: [],
    activeSegmentIndex: 0,
    segmentsHidden: [],
  };

  labelmap2D = {
    pixelData: new Uint16Array(labelmap3D.buffer, 0, length),
    segmentsOnLabelmap: [0, 1, 2],
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

describe('renderSegmentationOutline.js', () => {
  let getNewContext;

  beforeEach(() => {
    resetEvents();

    getNewContext = drawing.getNewContext;

    jest.clearAllMocks();
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

  describe('getOutline', () => {
    it('Should produce two segment outlines with 9 and 24 lines.', () => {
      const outline = getOutline(evt, labelmap3D, labelmap2D, lineWidth);
      const { start, end } = outline[1][0];

      expect(outline[1].length).toBe(9);
      expect(outline[2].length).toBe(24);
    });

    it('Should correctly scale the line segments to the canvas size whilst keeping thickness the same on canvas', () => {
      setCanvasTransform({
        scale: 4.0,
      });

      const outline = getOutline(evt, labelmap3D, labelmap2D, lineWidth);
      const { start, end } = outline[1][0];

      expect(start.x).toBeCloseTo(256);
      expect(start.y).toBeCloseTo(256.5);
      expect(end.x).toBeCloseTo(260);
      expect(end.y).toBeCloseTo(256.5);
    });

    it('Should correctly change the line thickness to 3 pixels, regardless of the canvas scale factor', () => {
      setCanvasTransform({
        scale: 4.0,
      });

      lineWidth = 2;

      const outline = getOutline(evt, labelmap3D, labelmap2D, lineWidth);
      const { start, end } = outline[1][0];

      expect(start.x).toBeCloseTo(256);
      expect(start.y).toBeCloseTo(257);
      expect(end.x).toBeCloseTo(260);
      expect(end.y).toBeCloseTo(257);
    });

    it('Should correctly rotate the line segments to the canvas (90 degrees)', () => {
      setCanvasTransform({
        rotation: 90,
      });

      const outline = getOutline(evt, labelmap3D, labelmap2D, lineWidth);
      const { start, end } = outline[1][0];

      // First horizontal line now vertical after rotation:

      expect(start.x).toBeCloseTo(191.5);
      expect(start.y).toBeCloseTo(64);
      expect(end.x).toBeCloseTo(191.5);
      expect(end.y).toBeCloseTo(65);
    });

    it('Should correctly horizontally flip the line segments to the canvas', () => {
      setCanvasTransform({
        hflip: true,
      });

      const outline = getOutline(evt, labelmap3D, labelmap2D, lineWidth);
      const { start, end } = outline[1][0];

      // First horizontal line now flipped horrizontally:

      expect(start.x).toBeCloseTo(192);
      expect(start.y).toBeCloseTo(64.5);
      expect(end.x).toBeCloseTo(191);
      expect(end.y).toBeCloseTo(64.5);
    });

    it('Should correctly vertically flip the line segments to the canvas', () => {
      setCanvasTransform({
        vflip: true,
      });

      const outline = getOutline(evt, labelmap3D, labelmap2D, lineWidth);
      const { start, end } = outline[1][0];

      // First horrizontal line now flipped vertically (pushed inside pixel even though its flipped):

      expect(start.x).toBeCloseTo(64);
      expect(start.y).toBeCloseTo(191.5);
      expect(end.x).toBeCloseTo(65);
      expect(end.y).toBeCloseTo(191.5);
    });

    it('Should correctly translate the line segments with the canvas', () => {
      setCanvasTransform({
        translation: { x: 10, y: 10 },
      });

      const outline = getOutline(evt, labelmap3D, labelmap2D, lineWidth);
      const { start, end } = outline[1][0];

      // First horrizontal line now translated (10,10) with canvas:

      expect(start.x).toBeCloseTo(74);
      expect(start.y).toBeCloseTo(74.5);
      expect(end.x).toBeCloseTo(75);
      expect(end.y).toBeCloseTo(74.5);
    });
  });

  describe('renderOutline', () => {
    it('should preserve the canvas transform matrix', () => {
      const outline = getOutline(evt, labelmap3D, labelmap2D, lineWidth);

      // Fake colormap to stop renderOutline breaking.
      state.colorLutTables[0] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

      const beforeCallTransformMatrix = evt.detail.canvasContext.getTransform();
      const newContextSetTransform = getNewContext().setTransform;

      evt.detail.canvasContext.getTransform.mockClear();
      getNewContext.mockClear();

      renderOutline(evt, outline, 0, true);

      expect(evt.detail.canvasContext.getTransform).toHaveBeenCalledTimes(1);
      expect(getNewContext).toHaveBeenCalledTimes(1);
      expect(getNewContext).toHaveBeenCalledWith(
        evt.detail.canvasContext.canvas
      );
      expect(newContextSetTransform).toHaveBeenCalledTimes(1);
      expect(newContextSetTransform).toHaveBeenCalledWith(
        beforeCallTransformMatrix
      );
    });

    it('Should call drawLines twice', () => {
      const outline = getOutline(evt, labelmap3D, labelmap2D, lineWidth);

      // Fake colormap to stop renderOutline breaking.
      state.colorLutTables[0] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

      renderOutline(evt, outline, 0, true);

      expect(drawing.drawLines).toBeCalledTimes(2);
    });
  });
});
