import { getBoundingBoxAroundCircle } from '../boundaries';
import { pointInEllipse } from '../../ellipse';
import { eraseOutsideShape } from '../helpers/eraseShape.js';
import getCircleCoords from '../../getCircleCoords';

import { getLogger } from '../../logger.js';

const logger = getLogger('util:segmentation:operations:eraseOutsideCircle');

/**
 * EraseOutsideCircle - Erase all pixels labeled with the activeSegmentIndex,
 * outside the region defined by the circle.
 * @param  {} evt The Cornerstone event.
 * @param  {} toolConfiguration Configuration of the tool applying the strategy.
 * @param {} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export default function eraseOutsideCircle(
  evt,
  toolConfiguration,
  operationData
) {
  const { segmentationMixinType } = operationData;
  const eventData = evt.detail;

  if (segmentationMixinType !== `circleSegmentationMixin`) {
    logger.error(
      `eraseOutsideCircle operation requires circleSegmentationMixin operationData, recieved ${segmentationMixinType}`
    );

    return;
  }

  const [topLeft, bottomRight] = getBoundingBoxAroundCircle(evt);
  const ellipse = getCircleCoords(
    eventData.handles.start,
    eventData.handles.end
  );

  eraseOutsideShape(
    evt,
    operationData,
    point => pointInEllipse(ellipse, point),
    topLeft,
    bottomRight
  );
}
