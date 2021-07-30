import {
  getBoundingBoxAroundCircle,
  fillInsideShape,
  fillOutsideShape,
} from '../../../util/segmentation';
import { pointInEllipse } from '../../../util/ellipse';
import getCircleCoords from '../../../util/getCircleCoords';

import { getLogger } from '../../../util/logger';

const logger = getLogger('util:segmentation:operations:fillCircle');

/**
 * Fill all pixels inside/outside the region defined by the circle.
 * @param  {} evt The Cornerstone event.
 * @param {}  operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
function fillCircle(evt, operationData, inside = true) {
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

  inside
    ? fillInsideShape(
        evt,
        operationData,
        point => pointInEllipse(ellipse, point),
        topLeft,
        bottomRight
      )
    : fillOutsideShape(
        evt,
        operationData,
        point => pointInEllipse(ellipse, point),
        topLeft,
        bottomRight
      );
}

/**
 * Fill all pixels inside/outside the region defined by the circle.
 * @param  {} evt The Cornerstone event.
 * @param {}  operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export function fillInsideCircle(evt, operationData) {
  fillCircle(evt, operationData, true);
}

/**
 * Fill all pixels outside the region defined by the circle.
 * @param  {} evt The Cornerstone event.
 * @param  {} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export function fillOutsideCircle(evt, operationData) {
  fillCircle(evt, operationData, false);
}
