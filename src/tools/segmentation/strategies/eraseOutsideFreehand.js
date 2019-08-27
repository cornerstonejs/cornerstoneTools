import {
  getBoundingBoxAroundPolygon,
  eraseOutsideShape,
} from '../../../util/segmentation';
import isPointInPolygon from '../../../util/isPointInPolygon';

import { getLogger } from '../../../util/logger';

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
  const { points, segmentationMixinType } = operationData;

  if (segmentationMixinType !== `freehandSegmentationMixin`) {
    logger.error(
      `eraseInsideFreehand operation requires freehandSegmentationMixin operationData, recieved ${segmentationMixinType}`
    );

    return;
  }

  // Obtain the bounding box of the entire drawing so that
  // we can subset our search. Outside of the bounding box,
  // everything is outside of the polygon.
  const { image } = evt.detail;
  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices, image);

  eraseOutsideShape(
    evt,
    operationData,
    point => isPointInPolygon([point.x, point.y], vertices),
    topLeft,
    bottomRight
  );
}
