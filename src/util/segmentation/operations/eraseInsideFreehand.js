import { getBoundingBoxAroundPolygon } from '../boundaries';
import pointInPolygon from '../../pointInPolygon';
import isSameSegment from './isSameSegment.js';

import { getLogger } from '../../logger';

const logger = getLogger('util:segmentation:operations:eraseInsideFreehand');

/**
 * Erase all pixels labeled with the activeSegmentIndex,
 * in the region defined by evt.operationData.points.
 * @param  {} evt The Cornerstone event.
 * @param  {} toolConfiguration Configuration of the tool applying the strategy.
 * @param  {} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export default function eraseInsideFreehand(
  evt,
  toolConfiguration,
  operationData
) {
  const eventData = evt.detail;
  const {
    pixelData,
    segmentIndex,
    points,
    segmentationMixinType,
  } = operationData;

  if (segmentationMixinType !== `freehandSegmentationMixin`) {
    logger.error(
      `eraseInsideFreehand operation requires freehandSegmentationMixin operationData, recieved ${segmentationMixinType}`
    );

    return;
  }

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
      const pixelIndex = j * width + i;

      // If the pixel is the same segmentIndex and is inside the
      // Region defined by the array of points, set their value to segmentIndex.
      if (
        isSameSegment(pixelIndex, pixelData, segmentIndex) &&
        pointInPolygon([i, j], vertices)
      ) {
        pixelData[pixelIndex] = 0;
      }
    }
  }
}
