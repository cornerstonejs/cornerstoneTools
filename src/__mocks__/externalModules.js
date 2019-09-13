export default {
  cornerstone: {
    getEnabledElement: jest.fn().mockImplementation(() => ({
      image: jest.fn(),
    })),
    getViewport: jest.fn(),
    imageCache: {
      getImageLoadObject: jest.fn(),
    },
    metaData: {
      get: jest.fn(),
    },
    pageToPixel: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
    })),
    pixelToCanvas: jest.fn(),
    setViewport: jest.fn(),
    updateImage: jest.fn(),
  },
  cornerstoneMath: {
    point: {
      distance: jest.fn(),
    },
  },
};
