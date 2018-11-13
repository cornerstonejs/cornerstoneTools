/**
 * Calculates the area of a freehand tool polygon.
 * @export @public @method
 * @name freehandArea
 *
 * @param {Object} dataHandles Data object associated with the tool.
 * @param {Object} scaling Area scaling of image.
 * @returns {number} The area of the polygon.
 */
export default function(dataHandles, scaling) {
  let freeHandArea = 0;
  let j = dataHandles.length - 1; // The last vertex is the previous one to the first

  scaling = scaling || 1; // If scaling is falsy, set scaling to 1

  for (let i = 0; i < dataHandles.length; i++) {
    freeHandArea +=
      (dataHandles[j].x + dataHandles[i].x) *
      (dataHandles[j].y - dataHandles[i].y);
    j = i; // Here j is previous vertex to i
  }

  return Math.abs((freeHandArea * scaling) / 2.0);
}
