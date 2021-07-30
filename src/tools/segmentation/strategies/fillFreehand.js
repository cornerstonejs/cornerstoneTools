import {
  getBoundingBoxAroundPolygon,
  fillInsideShape,
  fillOutsideShape,
} from '../../../util/segmentation';
import isPointInPolygon from '../../../util/isPointInPolygon';

import { getLogger } from '../../../util/logger';

const logger = getLogger('util:segmentation:operations:fillInsideFreehand');

/**
 * Fill all pixels inside/outside the region defined by
 * `operationData.points` with the `activeSegmentIndex` value.
 * @param  {} evt The Cornerstone event.
 * @param  {} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
function fillFreehand(evt, operationData, inside = true) {
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

  inside
    ? fillInsideShape(
        evt,
        operationData,
        point => isPointInPolygon([point.x, point.y], vertices),
        topLeft,
        bottomRight
      )
    : fillOutsideShape(
        evt,
        operationData,
        point => isPointInPolygon([point.x, point.y], vertices),
        topLeft,
        bottomRight
      );
}

/**
 * Fill all pixels inside/outside the region defined by `operationData.points`.
 * @param  {} evt The Cornerstone event.
 * @param {}  operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export function fillInsideFreehand(evt, operationData) {
  fillFreehand(evt, operationData, true);
}

/**
 * Fill all pixels outside the region defined by `operationData.points`.
 * @param  {} evt The Cornerstone event.
 * @param  {} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export function fillOutsideFreehand(evt, operationData) {
  fillFreehand(evt, operationData, false);
}
