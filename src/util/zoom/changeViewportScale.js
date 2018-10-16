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
export default function (viewport, ticks, scaleLimits) {
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
}
