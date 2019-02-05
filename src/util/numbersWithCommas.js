/**
 * Converts a number to a string with comma separators.
 * http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
 * @export @public @method
 * @name numbersWithCommas
 *
 * @param  {number} x The number to convert.
 * @returns {string}   The pretty-printed number as a string.
 */
export default function(x) {
  const parts = x.toString().split('.');

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
}
