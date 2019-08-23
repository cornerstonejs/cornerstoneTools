import { getBoundingBoxAroundPolygon } from '../boundaries';
import pointInPolygon from '../../pointInPolygon';
import fillOutsideShape from '../helpers/fillOutsideShape';

import { getLogger } from '../../logger';

const logger = getLogger('util:segmentation:operations:fillOutsideFreehand');

/**
 * Fill all pixels outside of the region defined by
 * evt.operationData.points with the activeSegmentIndex value.
 * @param  {} evt The Cornerstone event.
 * @param  {} toolConfiguration Configuration of the tool applying the strategy.
 * @param  {} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export default function fillOutsideFreehand(
  evt,
  toolConfiguration,
  operationData
) {
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

  fillOutsideShape(
    evt,
    operationData,
    point => {
      return pointInPolygon([point.x, point.y], vertices);
    },
    topLeft,
    bottomRight
  );
}
