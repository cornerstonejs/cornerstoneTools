/**
 * Corrects the shift by accountoing for viewport rotation and flips.
 * @export @public @method
 * @name correctShift
 *
 * @param  {Object} shift      The shift to correct.
 * @param  {Object} viewportOrientation  Object containing information on the viewport orientation.
 * @returns {Object}            The corrected shift.
 */
export default function(shift, viewportOrientation) {
  const { hflip, vflip, rotation } = viewportOrientation;

  // Apply Flips
  shift.x *= hflip ? -1 : 1;
  shift.y *= vflip ? -1 : 1;

  // Apply rotations
  if (rotation !== 0) {
    const angle = (rotation * Math.PI) / 180;

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const newX = shift.x * cosA - shift.y * sinA;
    const newY = shift.x * sinA + shift.y * cosA;

    shift.x = newX;
    shift.y = newY;
  }

  return shift;
}
