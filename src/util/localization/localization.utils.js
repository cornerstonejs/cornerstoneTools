/* eslint-disable import/extensions */
import i18next from 'i18next';
import de from '../../../locale/de.json';
import en from '../../../locale/en.json';
import fr from '../../../locale/fr.json';
import pt from '../../../locale/pt.json';

const resources = {
  de: {
    translation: de,
  },
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
  pt: {
    translation: pt,
  },
};

const charsToEscape = [
  '.',
  '^',
  '$',
  '*',
  '+',
  '-',
  '?',
  '(',
  ')',
  '[',
  ']',
  '{',
  '}',
  '\\',
  '|',
];

let _numberGroupCharRegExp = null;
let _decimalMark = null;

/**
 * Initializes localization functionality. It is ready when the returned promise resolves.
 * @param {string} lng Language code. I.e. "en-US"
 * @returns {Promise<TFunction>}
 */
export const initializeLocalization = (lng = 'en') => {
  _numberGroupCharRegExp = null;
  _decimalMark = null;

  return i18next.init({
    lng,
    resources,
  });
};

/**
 * Applies localization to a numerical value
 * @param {number} value Numerical value
 * @returns {string} localized value
 */
export const localizeNumber = value => {
  if (!i18next.isInitialized) {
    throw Error(
      'The localization library is not initialized. i18next needs to be initialized in order to localize numbers.'
    );
  }

  const localizedNumber =
    i18next.t('intlNumber', {
      val: value,
      formatParams: { val: { minimumFractionDigits: 2 } },
    }) || '';

  return localizedNumber
    .replace(_getNumberGroupCharRegExp(), ' ')
    .replace(_getDecimalMark(), ',');
};

/**
 * Translates text values
 * @param {string} key Translation key
 * @returns {string} Translated key
 */
export const translate = key => i18next.t(key);

const _escapeCharacter = character => {
  let result = character;

  if (charsToEscape.includes(character)) {
    result = `\\${character}`;
  }

  return result;
};

const _getGroupingCharacter = () => {
  const num = i18next.t('intlNumber', { val: 1000 });
  const groupChar = num.charAt(1);

  return _escapeCharacter(groupChar);
};

const _getNumberGroupCharRegExp = () => {
  if (_numberGroupCharRegExp === null) {
    _numberGroupCharRegExp = new RegExp(_getGroupingCharacter(), 'g');
  }

  return _numberGroupCharRegExp;
};

const _getDecimalMark = () => {
  if (_decimalMark === null) {
    const num = i18next.t('intlNumber', { val: 1.1 });

    _decimalMark = num.charAt(1);
  }

  return _decimalMark;
};
