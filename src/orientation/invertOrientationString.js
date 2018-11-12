/**
 * Inverts an orientation string.
 * @public
 * @function invertOrientationString
 *
 * @param  {string} orientationString The orientation.
 * @returns {string}  The inverted orientationString.
 */
export default function(orientationString) {
  let inverted = orientationString.replace('H', 'f');

  inverted = inverted.replace('F', 'h');
  inverted = inverted.replace('R', 'l');
  inverted = inverted.replace('L', 'r');
  inverted = inverted.replace('A', 'p');
  inverted = inverted.replace('P', 'a');
  inverted = inverted.toUpperCase();

  return inverted;
}
