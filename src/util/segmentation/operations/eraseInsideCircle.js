import { pointInEllipse } from '../../ellipse';
import { getLogger } from '../../logger.js';
import { eraseInsideShape } from '../helpers/eraseShape';
import getBoundingBoxAroundCircle from '../boundaries/getBoundingBoxAroundCircle.js';
import getCircleCoords from '../../getCircleCoords.js';

const logger = getLogger('util:segmentation:operations:eraseInsideCircle');

/**
 * EraseInsideCircle - Erase all pixels labeled with the activeSegmentIndex,
 * in the region defined by the circle.
 * @param  {Object} evt The Cornerstone event.
 * @param  {Object} toolConfiguration Configuration of the tool applying the strategy.
 * @param {Object}  operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export default function eraseInsideCircle(
  evt,
  toolConfiguration,
  operationData
) {
  const { segmentationMixinType } = operationData;

  if (segmentationMixinType !== `circleSegmentationMixin`) {
    logger.error(
      `eraseInsideCircle operation requires circleSegmentationMixin operationData, recieved ${segmentationMixinType}`
    );

    return;
  }

  const eventData = evt.detail;
  const [topLeft, bottomRight] = getBoundingBoxAroundCircle(evt);
  const ellipse = getCircleCoords(
    eventData.handles.start,
    eventData.handles.end
  );

  eraseInsideShape(
    evt,
    operationData,
    point => pointInEllipse(ellipse, point),
    topLeft,
    bottomRight
  );
}
