/* eslint-disable import/extensions */
import i18next from 'i18next';
import de from '../../../locale/de.json';
import en from '../../../locale/en.json';
import fr from '../../../locale/fr.json';
import pt from '../../../locale/pt.json';
import es from '../../../locale/es.json';
import it from '../../../locale/it.json';

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
  es: {
    translation: es,
  },
  it: {
    translation: it,
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

let _decimalMark = null;

/**
 * Initializes localization functionality. It is ready when the returned promise resolves.
 * @param {string} lng Language code. I.e. "en-US"
 * @returns {Promise<TFunction>}
 */
export const initializeLocalization = (lng = 'en') => {
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

  const [integer, decimal] = value.toString().split('.');
  const integerPartFormatted = formatAsEN12435(integer);

  if (decimal) {
    const localizedNumber =
      i18next.t('intlNumber', {
        val: value,
        formatParams: { val: { minimumFractionDigits: 0 } },
      }) || '';

    return `${integerPartFormatted},${
      localizedNumber.split(_getDecimalMark())[1]
    }`;
  }

  return `${integerPartFormatted}`;
};

// Adds a space every 3 characthers from right to left
function formatAsEN12435(str) {
  let result = '';

  for (let i = str.length - 1; i >= 0; i--) {
    result = str[i] + result;
    if (i > 0 && (str.length - i) % 3 === 0) {
      result = ` ${result}`;
    }
  }

  return result;
}

/**
 * Translates text values
 * @param {string} key Translation key
 * @returns {string} Translated key
 */
export const translate = key => i18next.t(key);

const _getDecimalMark = () => {
  if (_decimalMark === null) {
    const num = i18next.t('intlNumber', { val: 1.1 });

    _decimalMark = num.charAt(1);
  }

  return _decimalMark;
};
