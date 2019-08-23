import { getBoundingBoxAroundPolygon } from '../boundaries';

import { getLogger } from '../../logger';

/**
 * FillInsideBoundingBox - Fill all pixels in the region defined by
 * evt.operationData.points with the activeSegmentIndex value.
 * @param  {} evt The Cornerstone event.
 * @param {} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export default function fillInsideBoundingBox(evt, operationData) {
  const eventData = evt.detail;
  const { points, pixelData, segmentIndex } = operationData;

  // Obtain the bounding box of the entire drawing so that
  // we can subset our search.
  const { image } = eventData;
  const { width } = image;
  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices, image);
  const [xMin, yMin] = topLeft;
  const [xMax, yMax] = bottomRight;

  // Loop through all of the points inside the bounding box
  for (let i = xMin; i < xMax; i++) {
    for (let j = yMin; j < yMax; j++) {
      pixelData[j * width + i] = segmentIndex;
    }
  }
}
