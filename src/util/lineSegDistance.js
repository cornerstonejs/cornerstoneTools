import external from '../externalModules.js';

/**
 * Calculates the distance of a line segment from a point.
 * @export @public @method
 * @name lineSegDistance
 *
 * @param  {HTMLElement} element The element.
 * @param  {Object} start   The starting position of the line.
 * @param  {Object} end     The end position of the line.
 * @param  {Object} coords  The coordinates of the point.
 * @returns {name}         The distance between the line and the point.
 */
export default function(element, start, end, coords) {
  const cornerstone = external.cornerstone;

  const lineSegment = {
    start: cornerstone.pixelToCanvas(element, start),
    end: cornerstone.pixelToCanvas(element, end),
  };

  return external.cornerstoneMath.lineSegment.distanceToPoint(
    lineSegment,
    coords
  );
}
