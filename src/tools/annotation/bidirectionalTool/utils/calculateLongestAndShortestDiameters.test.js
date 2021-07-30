import calculateLongestAndShortestDiameters from './calculateLongestAndShortestDiameters.js';

let measurementData = {};
let pixelSpacing = {};

describe('CalculateLongestAndShortestDiameters.js', () => {
  beforeEach(() => {
    /* eslint-disable no-console */
    console.error = jest.fn();
    console.error.mockClear();
    console.warn = jest.fn();
    console.warn.mockClear();
    /* eslint-enable no-console */

    measurementData = {
      handles: {
        start: {
          x: 290.6229508196721,
          y: 272.7868852459016,
        },
        end: {
          x: 361.96721311475403,
          y: 191.99999999999997,
        },
        perpendicularStart: {
          x: 346.49180327868845,
          y: 250.22950819672127,
        },
        perpendicularEnd: {
          x: 306.0983606557376,
          y: 214.55737704918027,
        },
      },
    };
    pixelSpacing = {};
  });

  it('should calculates long/short diameters', () => {
    pixelSpacing = {
      rowPixelSpacing: 0.876953125,
      colPixelSpacing: 0.876953125,
    };

    const {
      longestDiameter,
      shortestDiameter,
    } = calculateLongestAndShortestDiameters(measurementData, pixelSpacing);

    expect(longestDiameter).toEqual('94.5');
    expect(shortestDiameter).toEqual('47.3');
  });

  it('should return values with scale of 1', () => {
    const {
      longestDiameter,
      shortestDiameter,
    } = calculateLongestAndShortestDiameters(measurementData, pixelSpacing);

    expect(shortestDiameter).toMatch(/\d*\.\d$/);
    expect(longestDiameter).toMatch(/\d*\.\d$/);
  });

  it('should use a default pixelSpacing of 1 when pixelSpacing is undefined', () => {
    const {
      longestDiameter,
      shortestDiameter,
    } = calculateLongestAndShortestDiameters(measurementData, pixelSpacing);

    expect(longestDiameter).toEqual('107.8');
    expect(shortestDiameter).toEqual('53.9');
  });

  it('should get longest and shortest diameters defined even with undefined handles', () => {
    measurementData.handles = {
      start: {
        x: 0,
        y: 0,
      },
      end: {
        x: 4,
        y: 4,
      },
      perpendicularStart: {},
      perpendicularEnd: {},
    };

    const {
      longestDiameter,
      shortestDiameter,
    } = calculateLongestAndShortestDiameters(measurementData, pixelSpacing);

    expect(shortestDiameter).toEqual('0.0');
    expect(longestDiameter).toEqual('5.7');
  });

  it('should make shortestDiameter always small than longestDiameter', () => {
    measurementData.handles = {
      start: {
        x: 10,
        y: 10,
      },
      end: {
        x: 5,
        y: 5,
      },
      perpendicularStart: {
        x: 12,
        y: 12,
      },
      perpendicularEnd: {
        x: 5,
        y: 5,
      },
    };

    const {
      longestDiameter,
      shortestDiameter,
    } = calculateLongestAndShortestDiameters(measurementData, pixelSpacing);

    expect(shortestDiameter).toEqual('7.1');
    expect(longestDiameter).toEqual('9.9');
  });
});
