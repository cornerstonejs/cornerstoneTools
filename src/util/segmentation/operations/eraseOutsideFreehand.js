import { getBoundingBoxAroundPolygon } from '../boundaries';
import pointInPolygon from '../../pointInPolygon';
import { eraseOutsideBoundingBox } from './index';

import { eraseIfSegmentIndex } from './index';

import { getLogger } from '../../logger';

const logger = getLogger('util:segmentation:operations:eraseOutsideFreehand');

/**
 * Erase all pixels labeled with the activeSegmentIndex,
 * outside the region defined by evt.operationData.points.
 * @param  {} evt The Cornerstone event.
 * @param  {} toolConfiguration Configuration of the tool applying the strategy.
 * @param {} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export default function eraseOutsideFreehand(
  evt,
  toolConfiguration,
  operationData
) {
  const {
    pixelData,
    segmentIndex,
    points,
    segmentationMixinType,
  } = operationData;

  if (segmentationMixinType !== `freehandSegmentationMixin`) {
    logger.error(
      `eraseOutsideFreehand operation requires freehandSegmentationMixin operationData, recieved ${segmentationMixinType}`
    );

    return;
  }

  // Loop through all pixels in the segmentation data mask
  // If they are outside of the region defined by the array of points, set their value to segmentIndex
  const eventData = evt.detail;
  const { image } = eventData;
  const { width } = image;
  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices, image);
  const [xMin, yMin] = topLeft;
  const [xMax, yMax] = bottomRight;

  // If we know exactly how big the polygon is,
  // we do not need to loop through the whole image.
  //
  // Outside of the polygon bounding box should definitely be filled
  // Inside of the polygon bounding box should be tested with pointInPolygon
  eraseOutsideBoundingBox(evt, operationData, topLeft, bottomRight);

  // Loop through all of the points inside the bounding box
  for (let i = xMin; i < xMax; i++) {
    for (let j = yMin; j < yMax; j++) {
      const outside = !pointInPolygon([i, j], vertices);

      if (outside) {
        eraseIfSegmentIndex(j * width + i, pixelData, segmentIndex);
      }
    }
  }
}
