/**
 * Corrects the shift by accountoing for viewport rotation and flips.
 * @export @public @method
 * @name correctShift
 *
 * @param  {object} shift      The shift to correct.
 * @param  {object} viewportOrientation  Object containing information on the viewport orientation.
 * @return {object}            The corrected shift.
 */
export const correctShift = function (shift, viewportOrientation) {
  const {hflip, vflip, rotation} = viewportOrientation;

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
};

/**
 * Changes the scale of the viewport.
 * @export @public @method
 * @name changeViewportScale
 *
 * @param {object} viewport The viewport to scale.
 * @param {number} ticks The change in magnifcation factor.
 * @param {object} scaleLimits The limits in scale.
 * @returns {object} The scaled viewport.
 */
export const changeViewportScale = function (viewport, ticks, scaleLimits) {
  const {maxScale, minScale} = scaleLimits;
  const pow = 1.7;
  const oldFactor = Math.log(viewport.scale) / Math.log(pow);
  const factor = oldFactor + ticks;
  const scale = Math.pow(pow, factor);

  if (maxScale && scale > maxScale) {
    viewport.scale = maxScale;
  } else if (minScale && scale < minScale) {
    viewport.scale = minScale;
  } else {
    viewport.scale = scale;
  }

  return viewport;
};
