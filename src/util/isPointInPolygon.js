/**
 * Checks whether a point is inside a polygon
 *
 * {@link https://github.com/substack/point-in-polygon/blob/master/index.js}
 * ray-casting algorithm based on
 * {@link http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html}
 *
 * @param {Array} point The point [x1, y1]
 * @param {Array} vs The vertices [[x1, y1], [x2, y2], ...] of the Polygon
 * @returns {boolean}
 */
export default function isPointInPolygon(point, vs) {
  const x = point[0];
  const y = point[1];
  let inside = false;

  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0];
    const yi = vs[i][1];

    const xj = vs[j][0];
    const yj = vs[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}
