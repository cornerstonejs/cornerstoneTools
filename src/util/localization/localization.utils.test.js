import * as localization from './localization.utils';

describe('localization utils', () => {
  const supportedLanguages = [
    { code: 'en', name: 'English' },
    {
      code: 'es',
      name: 'Spanish',
    },
    {
      code: 'it',
      name: 'Italian',
    },
    {
      code: 'pt',
      name: 'Portuguese',
    },
    {
      code: 'fr',
      name: 'French',
    },
  ];

  it('should throw an error if localization is attempted without initializing i18next', () =>
    expect(() => localization.localizeNumber(1000000.09)).toThrowError(
      'The localization library is not initialized. i18next needs to be initialized in order to localize numbers.'
    ));

  it.each(supportedLanguages)(
    'should localize using space grouping for %o',
    async ({ code }) => {
      await localization.initializeLocalization(code);
      expect(localization.localizeNumber(1000000.09)).toBe('1 000 000,09');
    }
  );

  it.each(supportedLanguages)(
    'should localize using space groupin thousands for %o',
    async ({ code }) => {
      await localization.initializeLocalization(code);
      expect(localization.localizeNumber(1000.09)).toBe('1 000,09');
    }
  );

  it.each(supportedLanguages)(
    'should localize adding 0s to complete decimal part for %o',
    async ({ code }) => {
      await localization.initializeLocalization(code);
      expect(localization.localizeNumber(1000000.9)).toBe('1 000 000,9');
    }
  );

  it.each(supportedLanguages)(
    'should localize adding previously inexisting decimal part for %o',
    async ({ code }) => {
      await localization.initializeLocalization(code);
      expect(localization.localizeNumber(1000000)).toBe('1 000 000');
    }
  );

  it.each(supportedLanguages)(
    'should localize decimal numbers for %o',
    async ({ code }) => {
      await localization.initializeLocalization(code);
      expect(localization.localizeNumber(0.012345678)).toBe('0,012');
    }
  );
});
