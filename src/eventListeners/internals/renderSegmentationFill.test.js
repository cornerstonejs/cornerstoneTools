import { getModule } from '../../store/index.js';
import { getLabelmapCanvas, renderFill } from './renderSegmentationFill.js';
import external from '../../externalModules.js';
import * as drawing from '../../drawing/index.js';

const { state } = getModule('segmentation');

jest.mock('../../drawing/index.js', () => {
  const getNewContextMock = {
    drawImage: jest.fn(),
    globalAlpha: 1.0,
    setTransform: jest.fn(),
    putImageData: jest.fn(),
  };

  return {
    getNewContext: jest.fn(() => getNewContextMock),
    transformCanvasContext: jest.fn(),
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
  cornerstoneMath: {
    point: {
      distance: ({ x: x1, y: y1 }, { x: x2, y: y2 }) =>
        Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)),
    },
  },
}));

// Mock implementation for ImageData
class MockImageData {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }
}
Object.defineProperty(window, 'ImageData', { value: MockImageData });

let eventData;
let evt;
let labelmap3D;
let labelmap2D;

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
    colorLUTIndex: 0,
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

describe('renderSegmentationFill.js', () => {
  let getNewContext;

  beforeEach(() => {
    resetEvents();

    getNewContext = drawing.getNewContext;

    jest.clearAllMocks();
  });

  describe('renderFill', () => {
    it('should preserve the canvas transform matrix', () => {
      // Fake colormap to stop renderFill breaking.
      state.colorLutTables[0] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

      const labelMapCanvas = getLabelmapCanvas(evt, labelmap3D, labelmap2D);

      const beforeCallTransformMatrix = evt.detail.canvasContext.getTransform();
      const newContextSetTransform = getNewContext().setTransform;

      evt.detail.canvasContext.getTransform.mockClear();
      getNewContext.mockClear();

      renderFill(evt, labelMapCanvas, true);

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

    it('should draw segmentation fill', () => {
      // Fake colormap to stop renderFill breaking.
      state.colorLutTables[0] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

      const labelMapCanvas = getLabelmapCanvas(evt, labelmap3D, labelmap2D);

      const { canvasContext, element, image, viewport } = evt.detail;
      const mockContext = getNewContext(canvasContext.canvas);

      jest.spyOn(external.cornerstone, 'pixelToCanvas');
      jest.spyOn(external.cornerstoneMath.point, 'distance');

      renderFill(evt, labelMapCanvas, true);

      const topLeft = {
        x: 0,
        y: 0,
      };
      const topRight = {
        x: image.width,
        y: 0,
      };
      const bottomRight = {
        x: image.width,
        y: image.height,
      };

      expect(external.cornerstone.pixelToCanvas).toHaveBeenCalledTimes(3);
      expect(external.cornerstone.pixelToCanvas).toHaveBeenCalledWith(
        element,
        topLeft
      );
      expect(external.cornerstone.pixelToCanvas).toHaveBeenCalledWith(
        element,
        topRight
      );
      expect(external.cornerstone.pixelToCanvas).toHaveBeenCalledWith(
        element,
        bottomRight
      );

      expect(external.cornerstoneMath.point.distance).toHaveBeenCalledTimes(2);
      expect(external.cornerstoneMath.point.distance).toHaveBeenCalledWith(
        topLeft,
        topRight
      );
      expect(external.cornerstoneMath.point.distance).toHaveBeenCalledWith(
        topRight,
        bottomRight
      );

      expect(drawing.transformCanvasContext).toHaveBeenCalledTimes(1);
      expect(drawing.transformCanvasContext).toHaveBeenCalledWith(
        mockContext,
        canvasContext.canvas,
        viewport
      );

      expect(mockContext.drawImage).toHaveBeenCalledTimes(1);
      expect(mockContext.drawImage).toHaveBeenCalledWith(
        labelMapCanvas,
        0,
        0,
        image.width,
        image.height
      );
    });
  });
});
