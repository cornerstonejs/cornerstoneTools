import getPixelSpacing from './getPixelSpacing';
import external from '../../externalModules.js';

jest.mock('../externalModules.js', () => ({
  cornerstone: {
    metaData: {
      get: jest.fn(),
    },
  },
}));

describe('getPixelSpacing', () => {
  it('should return rowPixelSpacing and colPixelSpacing from ultrasoundRegionSequence', () => {
    const image = {
      imageId: 'imageId',
    };

    const measurementData = {
      handles: {
        start: { x: 1, y: 2 },
        end: { x: 3, y: 4 },
      },
    };

    external.cornerstone.metaData.get = jest.fn();
    external.cornerstone.metaData.get.mockReturnValue({
      ultrasoundRegionSequence: [
        {
          physicalUnitsXDirection: 3,
          physicalUnitsYDirection: 3,
          physicalDeltaX: 1,
          physicalDeltaY: 1,
          regionLocationMinX0: 0,
          regionLocationMinY0: 0,
          regionLocationMaxX1: 4,
          regionLocationMaxY1: 4,
        },
      ],
    });

    const result = getPixelSpacing(image, measurementData);

    expect(result).toEqual({
      rowPixelSpacing: 10, // 1 * 10
      colPixelSpacing: 10, // 1 * 10
    });
  });

  it('should return rowPixelSpacing and colPixelSpacing as undefined if physicalUnitsXDirection and physicalUnitsYDirection are not 3', () => {
    const image = {
      imageId: 'imageId',
    };

    const measurementData = {
      handles: {
        start: { x: 1, y: 2 },
        end: { x: 3, y: 4 },
      },
    };

    external.cornerstone.metaData.get = jest.fn();
    external.cornerstone.metaData.get.mockReturnValue({
      ultrasoundRegionSequence: [
        {
          physicalUnitsXDirection: 2,
          physicalUnitsYDirection: 2,
          physicalDeltaX: 1,
          physicalDeltaY: 1,
          regionLocationMinX0: 0,
          regionLocationMinY0: 0,
          regionLocationMaxX1: 4,
          regionLocationMaxY1: 4,
        },
      ],
    });

    const result = getPixelSpacing(image, measurementData);

    expect(result).toEqual({
      rowPixelSpacing: undefined,
      colPixelSpacing: undefined,
    });
  });

  it('should return undefined pixel spacings if physicalDeltaX and physicalDeltaY are almost zero', () => {
    const image = { imageId: 'imageId' };
    const measurementData = {
      handles: {
        start: { x: 1, y: 2 },
        end: { x: 3, y: 4 },
      },
    };

    external.cornerstone.metaData.get.mockReturnValue({
      ultrasoundRegionSequence: [
        {
          physicalUnitsXDirection: 3,
          physicalUnitsYDirection: 3,
          physicalDeltaX: 1e-8, // Almost zero
          physicalDeltaY: 1e-8, // Almost zero
          regionLocationMinX0: 0,
          regionLocationMinY0: 0,
          regionLocationMaxX1: 4,
          regionLocationMaxY1: 4,
        },
      ],
    });

    const result = getPixelSpacing(image, measurementData);

    expect(result).toEqual({
      rowPixelSpacing: undefined,
      colPixelSpacing: undefined,
    });
  });

  it('should return undefined pixel spacings if physicalDeltaX and physicalDeltaY are NaN', () => {
    const image = { imageId: 'imageId' };
    const measurementData = {
      handles: {
        start: { x: 1, y: 2 },
        end: { x: 3, y: 4 },
      },
    };

    external.cornerstone.metaData.get.mockReturnValue({
      ultrasoundRegionSequence: [
        {
          physicalUnitsXDirection: 3,
          physicalUnitsYDirection: 3,
          physicalDeltaX: NaN,
          physicalDeltaY: NaN,
          regionLocationMinX0: 0,
          regionLocationMinY0: 0,
          regionLocationMaxX1: 4,
          regionLocationMaxY1: 4,
        },
      ],
    });

    const result = getPixelSpacing(image, measurementData);

    expect(result).toEqual({
      rowPixelSpacing: undefined,
      colPixelSpacing: undefined,
    });
  });

  it('should return rowPixelSpacing and colPixelSpacing as undefined if physicalDeltaX and physicalDeltaY are 0', () => {
    const image = {
      imageId: 'imageId',
    };

    const measurementData = {
      handles: {
        start: { x: 1, y: 2 },
        end: { x: 3, y: 4 },
      },
    };

    external.cornerstone.metaData.get = jest.fn();
    external.cornerstone.metaData.get.mockReturnValue({
      ultrasoundRegionSequence: [
        {
          physicalUnitsXDirection: 3,
          physicalUnitsYDirection: 3,
          physicalDeltaX: 0,
          physicalDeltaY: 0,
          regionLocationMinX0: 0,
          regionLocationMinY0: 0,
          regionLocationMaxX1: 4,
          regionLocationMaxY1: 4,
        },
      ],
    });

    const result = getPixelSpacing(image, measurementData);

    expect(result).toEqual({
      rowPixelSpacing: undefined,
      colPixelSpacing: undefined,
    });
  });

  it('should return rowPixelSpacing and colPixelSpacing from imagePlane if module is present', () => {
    const image = {
      imageId: 'imageId',
      rowPixelSpacing: 2,
      columnPixelSpacing: 3,
    };

    external.cornerstone.metaData.get = jest.fn();
    external.cornerstone.metaData.get.mockReturnValue({
      rowPixelSpacing: 10,
      columnPixelSpacing: 20,
    });

    const result = getPixelSpacing(image, null);

    expect(result).toEqual({
      rowPixelSpacing: 10,
      colPixelSpacing: 20,
    });
  });

  it('should return rowPixelSpacing and colPixelSpacing from image when both imagePlane and sopCommon modules are not present', () => {
    const image = {
      imageId: 'imageId',
      rowPixelSpacing: 5,
      columnPixelSpacing: 6,
    };

    external.cornerstone.metaData.get = jest.fn();
    external.cornerstone.metaData.get.mockReturnValue(null);

    const result = getPixelSpacing(image, null);

    expect(result).toEqual({
      rowPixelSpacing: 5,
      colPixelSpacing: 6,
    });
  });
});
