import {
  formatArea,
  formatLenght,
  formatDiameter,
} from './formatMeasurement.js';

jest.mock('./localization/localization.utils', () => ({
  __esModule: true,
  translate: jest.fn(val => val),
  localizeNumber: jest.fn(val => val),
}));

describe('formatMeasurement', () => {
  describe('formatLenght', () => {
    const length = '17,3';
    const uncertainty = '0,4';

    it.each([
      {
        unit: 'mm',
        displayUncertainties: false,
        expected: '17,3 mm',
      },
      {
        displayUncertainties: true,
        unit: 'mm',
        expected: '17,3 mm +/- 0,4 mm',
      },
      {
        unit: 'pix',
        displayUncertainties: false,
        expected: '17,3 pix',
      },
      {
        displayUncertainties: true,
        unit: 'pix',
        expected: '17,3 pix +/- 0,4 pix',
      },
    ])(
      'should render the right text when %o',
      ({ displayUncertainties, expected, unit }) => {
        const result = formatLenght(
          length,
          unit,
          uncertainty,
          displayUncertainties
        );

        expect(result).toEqual(expected);
      }
    );
  });

  describe('formatArea', () => {
    const area = '1260';
    const uncertainty = '180';

    it.each([
      {
        unit: 'mm',
        displayUncertainties: false,
        expected: 'area: 1260 mm²',
      },
      {
        displayUncertainties: true,
        unit: 'mm',
        expected: 'area: 1260 mm² +/- 180 mm²',
      },
      {
        unit: 'pix',
        displayUncertainties: false,
        expected: 'area: 1260 pix²',
      },
      {
        displayUncertainties: true,
        unit: 'pix',
        expected: 'area: 1260 pix² +/- 180 pix²',
      },
    ])(
      'should render the right text when %o',
      ({ displayUncertainties, expected, unit }) => {
        const result = formatArea(
          area,
          unit,
          uncertainty,
          displayUncertainties
        );

        expect(result).toEqual(expected);
      }
    );
  });

  describe('formatDiameter', () => {
    const diameter = '125,7';
    const uncertainty = '2';

    it.each([
      {
        unit: 'mm',
        displayUncertainties: false,
        expected: 'diameter: 125,7 mm',
      },
      {
        displayUncertainties: true,
        unit: 'mm',
        expected: 'diameter: 125,7 mm +/- 2 mm',
      },
      {
        unit: 'pix',
        isplayUncertainties: false,
        expected: 'diameter: 125,7 pix',
      },
      {
        displayUncertainties: true,
        unit: 'pix',
        expected: 'diameter: 125,7 pix +/- 2 pix',
      },
    ])(
      'should render the right text when %o',
      ({ displayUncertainties, expected, unit }) => {
        const result = formatDiameter(
          diameter,
          unit,
          uncertainty,
          displayUncertainties
        );

        expect(result).toEqual(expected);
      }
    );
  });
});
