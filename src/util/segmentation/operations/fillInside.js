import { getBoundingBoxAroundPolygon } from '../boundaries';
import pointInPolygon from '../../pointInPolygon';

import { getLogger } from '../../logger';

const logger = getLogger('util:segmentation:operations:fillInside');

/**
 * FillInside - Fill all pixels in the region defined by
 * evt.operationData.points with the activeSegmentIndex value.
 * @param  {} evt The Cornerstone event.
 * @param {} evt.operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export default function fillInside(evt) {
  const eventData = evt.detail;
  const { operationData } = evt;

  if (operationData.segmentationMixinType !== `freehandSegmentationMixin`) {
    logger.error(
      `fillInside operation requires freehandSegmentationMixin operationData, recieved ${
        operationData.segmentationMixinType
      }`
    );

    return;
  }

  const { pixelData, segmentIndex, points } = operationData;

  // Loop through all pixels in the segmentation data mask

  // Obtain the bounding box of the entire drawing so that
  // we can subset our search. Outside of the bounding box,
  // everything is outside of the polygon.
  const { image } = eventData;
  const { width } = image;
  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices, image);

  const [xMin, yMin] = topLeft;
  const [xMax, yMax] = bottomRight;

  // Loop through all of the points inside the bounding box
  for (let i = xMin; i < xMax; i++) {
    for (let j = yMin; j < yMax; j++) {
      // If they are inside of the region defined by the array of points, set their value to segmentIndex
      const inside = pointInPolygon([i, j], vertices);

      if (inside) {
        pixelData[j * width + i] = segmentIndex;
      }
    }
  }
}
