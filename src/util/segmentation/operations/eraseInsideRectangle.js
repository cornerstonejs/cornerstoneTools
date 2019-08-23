import { eraseInsideBoundingBox } from './index';
import { getLogger } from '../../logger';

const logger = getLogger('util:segmentation:operations:eraseInsideRectangle');

/**
 * EraseInsideRectangle - Erase all pixels inside the region defined
 * by the rectangle.
 * @param  {Object} evt The Cornerstone event.
 * @param  {Object} toolConfiguration Configuration of the tool applying the strategy.
 * @param  {Object} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export default function eraseInsideRectangle(
  evt,
  toolConfiguration,
  operationData
) {
  const { segmentationMixinType } = operationData;

  if (segmentationMixinType !== `rectangleSegmentationMixin`) {
    logger.error(
      `eraseInsideRectangle operation requires rectangleSegmentationMixin operationData, recieved ${segmentationMixinType}`
    );

    return;
  }

  eraseInsideBoundingBox(evt, operationData);
}
