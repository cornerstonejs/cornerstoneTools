import fillInsideShape from '../helpers/fillInsideShape';
import getBoundingBoxAroundPolygon from '../boundaries/getBoundingBoxAroundPolygon.js';
import { getLogger } from '../../logger';

const logger = getLogger('util:segmentation:operations:fillInsideRectangle');

/**
 * FillInsideRectangle - Fill all pixels inside the region defined
 * by the rectangle.
 * @param  {} evt The Cornerstone event.
 * @param  {} toolConfiguration Configuration of the tool applying the strategy.
 * @param {}  operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export default function fillInsideRectangle(
  evt,
  toolConfiguration,
  operationData
) {
  const { points, segmentationMixinType } = operationData;

  if (segmentationMixinType !== `rectangleSegmentationMixin`) {
    logger.error(
      `eraseInsideRectangle operation requires rectangleSegmentationMixin operationData, recieved ${segmentationMixinType}`
    );

    return;
  }

  // Loop through all pixels in the segmentation data mask

  // Obtain the bounding box of the entire drawing so that
  // we can subset our search.
  const { image } = evt.detail;
  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices, image);

  fillInsideShape(evt, operationData, () => true, topLeft, bottomRight);
}
