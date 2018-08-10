export const correctShift = function (shift, { hflip, vflip, rotation }) {
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

export const changeViewportScale = function (
  viewport,
  ticks,
  { maxScale, minScale }
) {
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
