import { getBoundingBoxAroundPolygon } from '../boundaries';
import { fillOutsideBoundingBox } from './index';

/**
 * FillOutsideRectangle - Fill all pixels outside the region defined
 * by the rectangle.
 * @param  {} evt The Cornerstone event.
 * @param {} evt.operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export default function fillOutsideRectangle(evt) {
  const eventData = evt.detail;
  const { operationData } = evt;
  const { points } = operationData;

  const { image } = eventData;

  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices, image);

  fillOutsideBoundingBox(evt, topLeft, bottomRight);
}
