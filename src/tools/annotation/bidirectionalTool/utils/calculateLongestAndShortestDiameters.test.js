import calculateLongestAndShortestDiameters from './calculateLongestAndShortestDiameters.js';

let measurementData = {};
let eventData = {};

describe('CalculateLongestAndShortestDiameters.js', () => {
  beforeEach(() => {
    console.error = jest.fn();
    console.error.mockClear();
    console.warn = jest.fn();
    console.warn.mockClear();

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
    eventData = {
      image: {},
    };
  });

  it('should calculates long/short diameters', () => {
    eventData = {
      image: {
        rowPixelSpacing: 0.876953125,
        columnPixelSpacing: 0.876953125,
      },
    };

    calculateLongestAndShortestDiameters(eventData, measurementData);

    expect(measurementData.longestDiameter).toEqual('94.5');
    expect(measurementData.shortestDiameter).toEqual('47.3');
  });

  it('should return values with scale of 1', () => {
    calculateLongestAndShortestDiameters(eventData, measurementData);

    expect(measurementData.shortestDiameter).toMatch(/\d*\.\d$/);
    expect(measurementData.longestDiameter).toMatch(/\d*\.\d$/);
  });

  it('should use a default pixelSpacing of 1 when pixelSpacing is undefined', () => {
    calculateLongestAndShortestDiameters(eventData, measurementData);

    expect(measurementData.longestDiameter).toEqual('107.8');
    expect(measurementData.shortestDiameter).toEqual('53.9');
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

    calculateLongestAndShortestDiameters(eventData, measurementData);

    expect(measurementData.shortestDiameter).toEqual('0.0');
    expect(measurementData.longestDiameter).toEqual('5.7');
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

    calculateLongestAndShortestDiameters(eventData, measurementData);

    expect(measurementData.shortestDiameter).toEqual('7.1');
    expect(measurementData.longestDiameter).toEqual('9.9');
  });
});
