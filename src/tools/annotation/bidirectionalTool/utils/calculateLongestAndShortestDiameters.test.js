import calculateLongestAndShortestDiameters from './calculateLongestAndShortestDiameters.js';
import lodash from 'lodash';

const measurementData = {
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

describe('CalculateLongestAndShortestDiameters.js', () => {
  beforeEach(() => {
    console.error = jest.fn();
    console.error.mockClear();
    console.warn = jest.fn();
    console.warn.mockClear();
  });

  describe('calculate diameters', () => {
    it('once we pass all data needed', () => {
      const newMeasurementData = lodash.cloneDeep(measurementData);
      const eventData = {
        image: {
          rowPixelSpacing: 0.876953125,
          columnPixelSpacing: 0.876953125,
        },
      };

      calculateLongestAndShortestDiameters(eventData, newMeasurementData);

      expect(newMeasurementData.longestDiameter).toEqual('94.5');
      expect(newMeasurementData.shortestDiameter).toEqual('47.3');
    });

    it('once pixelSpacing is undefined', () => {
      const newMeasurementData = lodash.cloneDeep(measurementData);
      const eventData = {
        image: {},
      };

      calculateLongestAndShortestDiameters(eventData, newMeasurementData);

      expect(newMeasurementData.longestDiameter).toEqual('107.8');
      expect(newMeasurementData.shortestDiameter).toEqual('53.9');
    });

    it('once shortestDiameter gets zero because perpendicular axis are undefined', () => {
      const newMeasurementData = lodash.cloneDeep(measurementData);

      newMeasurementData.handles = {
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

      const eventData = {
        image: {},
      };

      calculateLongestAndShortestDiameters(eventData, newMeasurementData);

      expect(newMeasurementData.shortestDiameter).toEqual('0.0');
      expect(newMeasurementData.longestDiameter).toEqual('5.7');
    });

    it('once shortestDiameter gets swaped with longestDiamater', () => {
      const newMeasurementData = lodash.cloneDeep(measurementData);

      newMeasurementData.handles = {
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

      const eventData = {
        image: {},
      };

      calculateLongestAndShortestDiameters(eventData, newMeasurementData);

      expect(newMeasurementData.shortestDiameter).toEqual('7.1');
      expect(newMeasurementData.longestDiameter).toEqual('9.9');
    });
  });
});
