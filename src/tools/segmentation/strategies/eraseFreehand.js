import {
  getBoundingBoxAroundPolygon,
  eraseInsideShape,
  eraseOutsideShape,
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
function eraseFreehand(evt, operationData, inside = true) {
  const { points, segmentationMixinType } = operationData;

  if (segmentationMixinType !== `freehandSegmentationMixin`) {
    logger.error(
      `eraseInsideFreehand operation requires freehandSegmentationMixin operationData, recieved ${segmentationMixinType}`
    );

    return;
  }

  const { image } = evt.detail;
  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices, image);

  inside
    ? eraseInsideShape(
        evt,
        operationData,
        point => isPointInPolygon([point.x, point.y], vertices),
        topLeft,
        bottomRight
      )
    : eraseOutsideShape(
        evt,
        operationData,
        point => isPointInPolygon([point.x, point.y], vertices),
        topLeft,
        bottomRight
      );
}

/**
 * Erase all pixels inside/outside the region defined by `operationData.points`.
 * @param  {} evt The Cornerstone event.
 * @param {}  operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export function eraseInsideFreehand(evt, operationData) {
  eraseFreehand(evt, operationData, true);
}

/**
 * Erase all pixels outside the region defined by `operationData.points`.
 * @param  {} evt The Cornerstone event.
 * @param  {} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export function eraseOutsideFreehand(evt, operationData) {
  eraseFreehand(evt, operationData, false);
}
