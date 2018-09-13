export default function getCircle (radius, rows, columns, xCoord = 0, yCoord = 0) {
  const x0 = Math.round(xCoord);
  const y0 = Math.round(yCoord);

  if (radius === 1) {
    return [[x0, y0]];
  }

  const circleArray = [];
  let index = 0;

  for(let y = -radius; y <= radius; y++) {
    const yCoord = y0 + y;

    if (yCoord > rows || yCoord < 0) {
      continue;
    }

    for(let x = -radius; x <= radius; x++) {
      const xCoord = x0 + x;

      if (xCoord > columns || xCoord < 0) {
        continue;
      }

      if (x * x + y * y < radius * radius) {
        circleArray[index++] = [x0 + x, y0 + y];
      }
    }
  }

  return circleArray;
}
