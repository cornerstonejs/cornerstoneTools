/**
 * Rounds a number to the specified precision.
 * @export @public @method
 * @name roundToDecimal
 *
 * @param  {number} value     The value to round.
 * @param  {number} precision The required precision.
 * @returns {number}           The rounded number.
 */
export default function(value, precision) {
  const multiplier = Math.pow(10, precision);

  return Math.round(value * multiplier) / multiplier;
}
