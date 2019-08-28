import { pointInEllipse } from '../../../util/ellipse';
import { getLogger } from '../../../util/logger';
import {
  eraseInsideShape,
  eraseOutsideShape,
  getBoundingBoxAroundCircle,
} from '../../../util/segmentation';
import getCircleCoords from '../../../util/getCircleCoords.js';

const logger = getLogger('util:segmentation:operations:eraseInsideCircle');

/**
 * EraseInsideCircle - Erase all pixels labeled with the activeSegmentIndex,
 * in the region defined by the circle.
 * @param  {Object} evt The Cornerstone event.
 * @param {Object}  operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
function eraseCircle(evt, operationData, inside = true) {
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

  inside
    ? eraseInsideShape(
        evt,
        operationData,
        point => pointInEllipse(ellipse, point),
        topLeft,
        bottomRight
      )
    : eraseOutsideShape(
        evt,
        operationData,
        point => pointInEllipse(ellipse, point),
        topLeft,
        bottomRight
      );
}

/**
 * Erase all pixels inside/outside the region defined by the circle.
 * @param  {} evt The Cornerstone event.
 * @param {}  operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export function eraseInsideCircle(evt, operationData) {
  eraseCircle(evt, operationData, true);
}

/**
 * Erase all pixels outside the region defined by the circle.
 * @param  {} evt The Cornerstone event.
 * @param  {} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export function eraseOutsideCircle(evt, operationData) {
  eraseCircle(evt, operationData, false);
}
