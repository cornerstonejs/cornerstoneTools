import getPixelSpacing from './getPixelSpacing';
import external from '../../externalModules.js';
import getUltraSoundPixelSpacing from './getUltraSoundPixelSpacing.js';
import getProjectionRadiographPixelSpacing from './getProjectionRadiographPixelSpacing.js';

jest.mock('../../externalModules.js', () => ({
  cornerstone: {
    metaData: {
      get: jest.fn(),
    },
  },
}));
jest.mock('./getUltraSoundPixelSpacing');
jest.mock('./getProjectionRadiographPixelSpacing');

describe('getPixelSpacing', () => {
  it('should call getUltraSoundPixelSpacing if ultrasoundRegionSequence is present', () => {
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

    getPixelSpacing(image, measurementData);

    expect(getUltraSoundPixelSpacing).toHaveBeenCalledTimes(1);
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
      unit: 'mm',
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
      unit: 'mm',
    });
  });

  it('should return pix units if pixel spacing is not present', () => {
    const image = {
      imageId: 'imageId',
    };

    external.cornerstone.metaData.get = jest.fn();
    external.cornerstone.metaData.get.mockReturnValue(null);

    const result = getPixelSpacing(image, null);

    expect(result).toEqual({
      rowPixelSpacing: undefined,
      colPixelSpacing: undefined,
      unit: 'pix',
    });
  });

  it('should call getProjectionRadiographicPixelSpacing if the image is of a projection radiograph SOP class', () => {
    const image = {
      imageId: 'imageId',
    };

    external.cornerstone.metaData.get = jest.fn();
    external.cornerstone.metaData.get.mockReturnValue({
      sopClassUid: '1.2.840.10008.5.1.4.1.1.1.2',
    });

    getPixelSpacing(image, null);

    expect(getProjectionRadiographPixelSpacing).toHaveBeenCalledTimes(1);
  });
});
