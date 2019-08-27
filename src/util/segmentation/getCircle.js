/**
 * Gets the pixels within the circle.
 * @export @public @method
 * @name getCircle
 *
 * @param  {number} radius     The radius of the circle.
 * @param  {number} rows       The number of rows.
 * @param  {number} columns    The number of columns.
 * @param  {number} [xCoord = 0] The x-location of the center of the circle.
 * @param  {number} [yCoord = 0] The y-location of the center of the circle.
 * @returns {Array.number[]}        Array of pixels contained within the circle.
 */
export default function getCircle(
  radius,
  rows,
  columns,
  xCoord = 0,
  yCoord = 0
) {
  const x0 = Math.floor(xCoord);
  const y0 = Math.floor(yCoord);

  if (radius === 1) {
    return [[x0, y0]];
  }

  const circleArray = [];
  let index = 0;

  for (let y = -radius; y <= radius; y++) {
    const yCoord = y0 + y;

    if (yCoord > rows || yCoord < 0) {
      continue;
    }

    for (let x = -radius; x <= radius; x++) {
      const xCoord = x0 + x;

      if (xCoord >= columns || xCoord < 0) {
        continue;
      }

      if (x * x + y * y < radius * radius) {
        circleArray[index++] = [x0 + x, y0 + y];
      }
    }
  }

  return circleArray;
}
