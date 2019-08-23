import { getBoundingBoxAroundCircle } from '../boundaries';
import { pointInEllipse } from '../../ellipse';
import { fillOutsideShape } from '../helpers/fillShape';
import getCircleCoords from '../../getCircleCoords';

import { getLogger } from '../../logger.js';

const logger = getLogger('util:segmentation:operations:fillOutsideCircle');

/**
 * FillOutsideCircle - Fill all pixels outside the region defined
 * by the circle.
 * @param  {} evt The Cornerstone event.
 * @param  {} toolConfiguration Configuration of the tool applying the strategy.
 * @param  {} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export default function fillOutsideCircle(
  evt,
  toolConfiguration,
  operationData
) {
  const { segmentationMixinType } = operationData;

  if (segmentationMixinType !== `circleSegmentationMixin`) {
    logger.error(
      `fillInsideCircle operation requires circleSegmentationMixin operationData, recieved ${segmentationMixinType}`
    );

    return;
  }

  const eventData = evt.detail;
  const [topLeft, bottomRight] = getBoundingBoxAroundCircle(evt);
  const ellipse = getCircleCoords(
    eventData.handles.start,
    eventData.handles.end
  );

  fillOutsideShape(
    evt,
    operationData,
    point => pointInEllipse(ellipse, point),
    topLeft,
    bottomRight
  );
}
