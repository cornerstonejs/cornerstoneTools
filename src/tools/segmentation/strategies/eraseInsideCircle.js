import { pointInEllipse } from '../../../util/ellipse';
import { getLogger } from '../../../util/logger';
import {
  eraseInsideShape,
  getBoundingBoxAroundCircle,
} from '../../../util/segmentation';
import getCircleCoords from '../../../util/getCircleCoords.js';

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
