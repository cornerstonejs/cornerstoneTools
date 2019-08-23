import { getBoundingBoxAroundPolygon } from '../boundaries';
import eraseIfSegmentIndex from './eraseIfSegmentIndex.js';

/**
 * EraseInsideBoundingBox - Erase all pixels labeled with the activeSegmentIndex,
 * in the bouding box containing all points from evt.operationData.points.
 * @param  {} evt The Cornerstone event.
 * @param {} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export default function eraseInsideBoundingBox(evt, operationData) {
  const eventData = evt.detail;
  const { points, pixelData, segmentIndex } = operationData;

  // Loop through all pixels in the segmentation data mask

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
      const pixelIndex = j * width + i;

      eraseIfSegmentIndex(pixelIndex, pixelData, segmentIndex);
    }
  }
}
