import external from '../externalModules.js';
// SUT
import calculateSUV from './calculateSUV.js';

jest.mock('./../externalModules.js', () => ({
  cornerstone: {
    metaData: {
      get: jest
        .fn()
        .mockReturnValueOnce({
          patientWeight: 1,
        })
        .mockReturnValueOnce({
          modality: 'PT',
          seriesTime: {
            fractionalSeconds: 0,
            seconds: 0,
            minutes: 0,
            hours: 0,
          },
        })
        .mockReturnValueOnce({
          radiopharmaceuticalInfo: {
            radiopharmaceuticalStartTime: {
              fractionalSeconds: 0,
              seconds: 0,
              minutes: 0,
              hours: 0,
            },
            radionuclideTotalDose: 1,
            radionuclideHalfLife: 1,
          },
        }),
    },
  },
}));

const image = {
  imageId: 0,
  slope: 1,
  intercept: 1,
};

describe('calculateSUV.js', () => {
  it('calculates SUV by scaling the pixel value by default', () => {
    // Setup
    const pixelValue = 10;

    //
    const result = calculateSUV(image, pixelValue);

    // Assert
    expect(result).toBe(1100);
  });
});

it('does not rescale the pixel value when skipRescale is true', () => {
  // Setup
  const pixelValue = 10;
  const skipRescale = true;

  //
  const result = calculateSUV(image, pixelValue, skipRescale);

  // Assert
  expect(result).toBe(1000);
});
