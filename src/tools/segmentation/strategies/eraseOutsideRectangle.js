import {
  getBoundingBoxAroundPolygon,
  eraseOutsideBoundingBox,
} from '../../../util/segmentation';

import { getLogger } from '../../../util/logger';

const logger = getLogger('util:segmentation:operations:eraseOutsideRectangle');

/**
 * EraseOutsideRectangle - Erase all pixels labeled with the activeSegmentIndex,
 * outside the region defined by the rectangle.
 * @param  {} evt The Cornerstone event.
 * @param {} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export default function eraseOutsideRectangle(evt, operationData) {
  const { points } = operationData;

  if (operationData.segmentationMixinType !== `rectangleSegmentationMixin`) {
    logger.error(
      `eraseOutsideRectangle operation requires rectangleSegmentationMixin operationData, recieved ${
        operationData.segmentationMixinType
      }`
    );

    return;
  }

  const { image } = evt.detail;
  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices, image);

  eraseOutsideBoundingBox(evt, operationData, topLeft, bottomRight);
}
