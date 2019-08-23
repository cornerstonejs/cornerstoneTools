export default function getBoundingBoxAroundPolygon(vertices, image) {
  let xMin = Infinity;
  let xMax = 0;
  let yMin = Infinity;
  let yMax = 0;
  const { width, height } = image;

  vertices.forEach(v => {
    xMin = Math.min(v[0], xMin);
    xMax = Math.max(v[0], xMax);
    yMin = Math.min(v[1], yMin);
    yMax = Math.max(v[1], yMax);
  });

  xMin = Math.floor(xMin);
  yMin = Math.floor(yMin);
  xMax = Math.floor(xMax);
  yMax = Math.floor(yMax);

  xMax = Math.min(width, xMax);
  xMin = Math.max(0, xMin);
  yMax = Math.min(height, yMax);
  yMin = Math.max(0, yMin);

  return [[xMin, yMin], [xMax, yMax]];
}
