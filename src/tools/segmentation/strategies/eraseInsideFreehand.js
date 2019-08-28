import {
  getBoundingBoxAroundPolygon,
  eraseInsideShape,
} from '../../../util/segmentation';
import isPointInPolygon from '../../../util/isPointInPolygon';

import { getLogger } from '../../../util/logger';

const logger = getLogger('util:segmentation:operations:eraseInsideFreehand');

/**
 * Erase all pixels labeled with the activeSegmentIndex,
 * in the region defined by evt.operationData.points.
 * @param  {} evt The Cornerstone event.
 * @param  {} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export default function eraseInsideFreehand(evt, operationData) {
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

  eraseInsideShape(
    evt,
    operationData,
    point => isPointInPolygon([point.x, point.y], vertices),
    topLeft,
    bottomRight
  );
}
