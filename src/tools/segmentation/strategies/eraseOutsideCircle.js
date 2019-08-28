import {
  getBoundingBoxAroundCircle,
  eraseOutsideShape,
} from '../../../util/segmentation';
import { pointInEllipse } from '../../../util/ellipse';
import getCircleCoords from '../../../util/getCircleCoords';

import { getLogger } from '../../../util/logger';

const logger = getLogger('util:segmentation:operations:eraseOutsideCircle');

/**
 * EraseOutsideCircle - Erase all pixels labeled with the activeSegmentIndex,
 * outside the region defined by the circle.
 * @param  {} evt The Cornerstone event.
 * @param {} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export default function eraseOutsideCircle(evt, operationData) {
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
