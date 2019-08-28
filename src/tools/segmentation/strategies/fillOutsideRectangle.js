import {
  getBoundingBoxAroundPolygon,
  fillOutsideBoundingBox,
} from '../../../util/segmentation';

import { getLogger } from '../../../util/logger';

const logger = getLogger('util:segmentation:operations:fillOutsideRectangle');

/**
 * FillOutsideRectangle - Fill all pixels outside the region defined
 * by the rectangle.
 * @param  {} evt The Cornerstone event.
 * @param  {} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export default function fillOutsideRectangle(evt, operationData) {
  const { points, segmentationMixinType } = operationData;

  if (segmentationMixinType !== `rectangleSegmentationMixin`) {
    logger.error(
      `fillOutsideRectangle operation requires rectangleSegmentationMixin operationData, recieved ${segmentationMixinType}`
    );

    return;
  }

  const { image } = evt.detail;
  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices, image);

  fillOutsideBoundingBox(evt, operationData, topLeft, bottomRight);
}
