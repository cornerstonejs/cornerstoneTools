import {
  fillInsideShape,
  getBoundingBoxAroundPolygon,
  fillOutsideBoundingBox,
} from '../../../util/segmentation';
import { getLogger } from '../../../util/logger';

const logger = getLogger('util:segmentation:operations:fillInsideRectangle');

/**
 * FillInsideRectangle - Fill all pixels inside/outside the region defined
 * by the rectangle.
 * @param  {} evt The Cornerstone event.
 * @param {}  operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
function fillRectangle(evt, operationData, inside = true) {
  const { points, segmentationMixinType } = operationData;

  if (segmentationMixinType !== `rectangleSegmentationMixin`) {
    logger.error(
      `eraseInsideRectangle operation requires rectangleSegmentationMixin operationData, recieved ${segmentationMixinType}`
    );

    return;
  }

  const { image } = evt.detail;
  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices, image);

  inside
    ? fillInsideShape(evt, operationData, () => true, topLeft, bottomRight)
    : fillOutsideBoundingBox(evt, operationData, topLeft, bottomRight);
}

/**
 * Fill all pixels inside/outside the region defined by the rectangle.
 * @param  {} evt The Cornerstone event.
 * @param {}  operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export function fillInsideRectangle(evt, operationData) {
  fillRectangle(evt, operationData, true);
}

/**
 * Fill all pixels outside the region defined by the rectangle.
 * @param  {} evt The Cornerstone event.
 * @param  {} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export function fillOutsideRectangle(evt, operationData) {
  fillRectangle(evt, operationData, false);
}
