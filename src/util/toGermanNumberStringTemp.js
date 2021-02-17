/**
 * Temporary solution for german string formatting.
 * Should be replaced by proper localization.
 * @param {*} value
 */
export default function(value) {
  const result = value
    .toFixed(2)
    .replace('.', ',') // replace decimal point separator
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 '); // apply grouping of three digits with whitespace

  return result;
}
