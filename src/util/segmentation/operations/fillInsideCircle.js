import { getBoundingBoxAroundCircle } from '../boundaries';
import { pointInEllipse } from '../../ellipse';
import getCircleCoords from '../../getCircleCoords';
import fillInsideShape from '../helpers/fillInsideShape.js';

import { getLogger } from '../../logger.js';

const logger = getLogger('util:segmentation:operations:fillInsideCircle');

/**
 * FillInsideCircle - Fill all pixels in the region defined
 * by the circle.
 * @param  {} evt The Cornerstone event.
 * @param  {} toolConfiguration Configuration of the tool applying the strategy.
 * @param {}  operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export default function fillInsideCircle(
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

  fillInsideShape(
    evt,
    operationData,
    point => {
      return pointInEllipse(ellipse, point);
    },
    topLeft,
    bottomRight
  );
}
