import { getLogger } from '../../../util/logger';
import {
  getBoundingBoxAroundPolygon,
  eraseInsideShape,
  eraseOutsideBoundingBox,
} from '../../../util/segmentation';

const logger = getLogger('util:segmentation:operations:eraseInsideRectangle');

/**
 * Erase all pixels inside the region defined by the rectangle.
 * @param  {Object} evt The Cornerstone event.
 * @param  {Object} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
function eraseRectangle(evt, operationData, inside = true) {
  const { points, segmentationMixinType } = operationData;

  if (segmentationMixinType !== `rectangleSegmentationMixin`) {
    logger.error(
      `eraseInsideRectangle operation requires rectangleSegmentationMixin operationData, recieved ${segmentationMixinType}`
    );

    return;
  }

  const eventData = evt.detail;

  // Loop through all pixels in the segmentation data mask

  // Obtain the bounding box of the entire drawing so that
  // we can subset our search.
  const { image } = eventData;
  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices, image);

  inside
    ? eraseInsideShape(evt, operationData, () => true, topLeft, bottomRight)
    : eraseOutsideBoundingBox(evt, operationData, topLeft, bottomRight);
}

/**
 * Erase all pixels inside/outside the region defined by the rectangle.
 * @param  {} evt The Cornerstone event.
 * @param {}  operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export function eraseInsideRectangle(evt, operationData) {
  eraseRectangle(evt, operationData, true);
}

/**
 * Erase all pixels outside the region defined by the rectangle.
 * @param  {} evt The Cornerstone event.
 * @param  {} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export function eraseOutsideRectangle(evt, operationData) {
  eraseRectangle(evt, operationData, false);
}
