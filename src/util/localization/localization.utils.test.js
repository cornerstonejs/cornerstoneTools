import * as localization from './localization.utils';

const num1 = 1000000.09;
const num2 = 1000000.9;
const num3 = 1000000;
const num4 = 0.012345678;

describe('localization utils', () => {
  it('should throw an error if localization is attempted without initializing i18next', () =>
    expect(() => localization.localizeNumber(num1)).toThrowError(
      'The localization library is not initialized. i18next needs to be initialized in order to localize numbers.'
    ));

  describe('German number localization', () => {
    // eslint-disable-next-line no-return-await
    beforeAll(async () => await localization.initializeLocalization('de'));

    it('should localize using space grouping', () => {
      expect(localization.localizeNumber(num1)).toBe('1 000 000,09');
    });

    it('should localize adding 0s to complete decimal part', () => {
      expect(localization.localizeNumber(num2)).toBe('1 000 000,90');
    });

    it('should localize adding previously inexisting decimal part', () => {
      expect(localization.localizeNumber(num3)).toBe('1 000 000,00');
    });

    it('should localize decimal numbers', () => {
      expect(localization.localizeNumber(num4)).toBe('0,012');
    });
  });

  describe('English number localization', () => {
    // eslint-disable-next-line no-return-await
    beforeAll(async () => await localization.initializeLocalization('en-US'));

    it('should localize using space grouping', () => {
      expect(localization.localizeNumber(num1)).toBe('1 000 000,09');
    });

    it('should localize adding 0s to complete decimal part', () => {
      expect(localization.localizeNumber(num2)).toBe('1 000 000,90');
    });

    it('should localize adding previously inexisting decimal part', () => {
      expect(localization.localizeNumber(num3)).toBe('1 000 000,00');
    });

    it('should localize decimal numbers', () => {
      expect(localization.localizeNumber(num4)).toBe('0,012');
    });
  });

  describe('French number localization', () => {
    // eslint-disable-next-line no-return-await
    beforeAll(async () => await localization.initializeLocalization('fr'));

    it('should localize using space grouping', () => {
      expect(localization.localizeNumber(num1)).toBe('1 000 000,09');
    });

    it('should localize adding 0s to complete decimal part', () => {
      expect(localization.localizeNumber(num2)).toBe('1 000 000,90');
    });

    it('should localize adding previously inexisting decimal part', () => {
      expect(localization.localizeNumber(num3)).toBe('1 000 000,00');
    });

    it('should localize decimal numbers', () => {
      expect(localization.localizeNumber(num4)).toBe('0,012');
    });
  });

  describe('Portuguese number localization', () => {
    // eslint-disable-next-line no-return-await
    beforeAll(async () => await localization.initializeLocalization('pt'));

    it('should localize using space grouping', () => {
      expect(localization.localizeNumber(num1)).toBe('1 000 000,09');
    });

    it('should localize adding 0s to complete decimal part', () => {
      expect(localization.localizeNumber(num2)).toBe('1 000 000,90');
    });

    it('should localize adding previously inexisting decimal part', () => {
      expect(localization.localizeNumber(num3)).toBe('1 000 000,00');
    });

    it('should localize decimal numbers', () => {
      expect(localization.localizeNumber(num4)).toBe('0,012');
    });
  });

  describe('Text localization', () => {
    // eslint-disable-next-line no-return-await
    beforeAll(async () => await localization.initializeLocalization('pt'));

    it('should localize a key', () => {
      expect(localization.translate('average')).toBe('méd.');
    });

    it('should return a non recognized key', () => {
      expect(localization.translate('thisKeyDoesNotExist')).toBe(
        'thisKeyDoesNotExist'
      );
    });
  });
});
