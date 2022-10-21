import Decimal from 'decimal.js';
import * as measurementUncertainty from './measurementUncertaintyTool';

describe('util: measurementUncertaintyTool.js', () => {
  it('returns pixelDiagnoal value calculated by avaiable pixelSpacing inputs', () => {
    const colPixelSpacing = 0.123;
    const rowPixelSpacing = 0.123;
    const pixelDiagonal = measurementUncertainty
      .getPixelDiagonal(colPixelSpacing, rowPixelSpacing)
      .toFixed(7);

    expect(pixelDiagonal).toEqual('0.1739483');
  });

  it('returns pixelDiagnoal value calculated with square root of two when falsy rowPixelSpacing value', () => {
    const colPixelSpacing = 0.123;
    const rowPixelSpacing = undefined;
    const pixelDiagonal = measurementUncertainty
      .getPixelDiagonal(colPixelSpacing, rowPixelSpacing)
      .toFixed(7);

    expect(pixelDiagonal).toEqual('1.4142136');
  });

  it('returns pixelDiagnoal value calculated with square root of two with falsy colPixelSpacing value', () => {
    const colPixelSpacing = null;
    const rowPixelSpacing = 0.123;
    const pixelDiagonal = measurementUncertainty
      .getPixelDiagonal(colPixelSpacing, rowPixelSpacing)
      .toFixed(7);

    expect(pixelDiagonal).toEqual('1.4142136');
  });

  it('returns rounded value of input based on uncertainty less than 1', () => {
    const inputValue = 291.9878225987628;
    const uncertainty = 0.02595339539885377778;
    const roundedValue = measurementUncertainty.roundValueBasedOnUncertainty(
      inputValue,
      uncertainty
    );

    expect(roundedValue).toEqual('291.988');
  });

  it('returns rounded value of input based on uncertainty greater than 1', () => {
    const inputValue = 291.9878225987628;
    const uncertainty = 11.32595339539885377778;
    const roundedValue = measurementUncertainty.roundValueBasedOnUncertainty(
      inputValue,
      uncertainty
    );

    expect(roundedValue).toEqual(new Decimal(292));
  });

  it('returns the index of a first significant figure greater when the figure is greater than 2', () => {
    const uncertainty = 0.32595339539885377778;
    const firstSFIndex = measurementUncertainty.getIndexOfFirstSignificantDigit(
      uncertainty
    );

    expect(firstSFIndex).toEqual(new Decimal(1));
  });

  it('returns the index of a first significant figure of the number less than 1', () => {
    const uncertainty = 0.00595339539885377778;
    const firstSFIndex = measurementUncertainty.getIndexOfFirstSignificantDigit(
      uncertainty
    );

    expect(firstSFIndex).toEqual(new Decimal(3));
  });

  it('returns a rounding range when uncertainty below 1 and first significant number is 1 or 2', () => {
    const uncertainty = 0.02595339539885377778;
    const decimalRoundingRange = measurementUncertainty.getRoundingRange(
      uncertainty
    );

    expect(decimalRoundingRange).toEqual(3);
  });

  it('returns a rounding range when uncertainty below 1 and first significant number greater than 2', () => {
    const uncertainty = 0.595339539885377778;
    const decimalRoundingRange = measurementUncertainty.getRoundingRange(
      uncertainty
    );

    expect(decimalRoundingRange).toEqual(1);
  });

  it('returns a rounding range when uncertainty above 1 and first significant number is 1 or 2', () => {
    const uncertainty = 150.0595339539885377778;
    const decimalRoundingRange = measurementUncertainty.getRoundingRange(
      uncertainty
    );

    expect(decimalRoundingRange).toEqual(new Decimal(10));
  });

  it('returns a rounding range when uncertainty above 1 and first significant number is greater than 2', () => {
    const uncertainty = 500.0595339539885377778;
    const decimalRoundingRange = measurementUncertainty.getRoundingRange(
      uncertainty
    );

    expect(decimalRoundingRange).toEqual(new Decimal(100));
  });

  it('returns a number rounded with three decimal if inputValue is equal and less than 1.5 ', () => {
    const inputValue = 0.234234;
    const result = measurementUncertainty.getGenericRounding(inputValue);

    expect(result).toEqual(0.234);
  });

  it('returns a number rounded up to three decimal places if inputValue is equal and less than 1.5 ', () => {
    const inputValue = 1.27;
    const result = measurementUncertainty.getGenericRounding(inputValue);

    expect(result).toEqual(1.27);
  });

  it('returns a number rounded with two decimal places if inputValue is great than 1.5 and less than 10 ', () => {
    const inputValue = 8.23623;
    const result = measurementUncertainty.getGenericRounding(inputValue);

    expect(result).toEqual(8.24);
  });

  it('returns a number rounded with one decimal if inputValue is equal and great than 10 and equal and less than 100 ', () => {
    const inputValue = 28.36523;
    const result = measurementUncertainty.getGenericRounding(inputValue);

    expect(result).toEqual(28.4);
  });

  it('returns a number rounded to one if inputValue is equal and great than 100', () => {
    const inputValue = 287.9;
    const result = measurementUncertainty.getGenericRounding(inputValue);

    expect(result).toEqual(288);
  });

  it('returns falsy value when uncertainty is falsy', () => {
    const uncertainty = null;
    const result = measurementUncertainty.roundUncertainty(uncertainty);

    expect(result).toEqual(undefined);
  });

  it('returns falsy value when area is falsy', () => {
    const area = null;
    const uncertainty = 1;
    const result = measurementUncertainty.roundArea(area, uncertainty);

    expect(result).toEqual(undefined);
  });

  it('returns falsy value when uncertainty is falsy', () => {
    const area = 1;
    const uncertainty = null;
    const result = measurementUncertainty.roundArea(area, uncertainty);

    expect(result).toEqual(undefined);
  });
});
