import { fillInsideBoundingBox } from './index';
import { getLogger } from '../../logger';

const logger = getLogger('util:segmentation:operations:fillInsideRectangle');

/**
 * FillInsideRectangle - Fill all pixels inside the region defined
 * by the rectangle.
 * @param  {} evt The Cornerstone event.
 * @param {} evt.operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export default function fillInsideRectangle(evt) {
  const { operationData } = evt;

  if (operationData.segmentationMixinType !== `rectangleSegmentationMixin`) {
    logger.error(
      `fillInsideRectangle operation requires rectangleSegmentationMixin operationData, recieved ${
        operationData.segmentationMixinType
      }`
    );

    return;
  }

  fillInsideBoundingBox(evt);
}
