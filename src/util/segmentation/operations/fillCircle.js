import { getBoundingBoxAroundCircle } from '../boundaries';
import { pointInEllipse } from '../../ellipse';
import getCircleCoords from '../../getCircleCoords';
import { fillInsideShape, fillOutsideShape } from '../helpers/fillShape.js';

import { getLogger } from '../../logger.js';

const logger = getLogger('util:segmentation:operations:fillInsideCircle');

/**
 * Fill all pixels inside/outside the region defined by the circle.
 * @param  {} evt The Cornerstone event.
 * @param  {} toolConfiguration Configuration of the tool applying the strategy.
 * @param {}  operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
function fillCircle(evt, toolConfiguration, operationData, inside = true) {
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
 * @param  {} toolConfiguration Configuration of the tool applying the strategy.
 * @param {}  operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export function fillInsideCircle(evt, toolConfiguration, operationData) {
  fillCircle(evt, toolConfiguration, operationData, true);
}

/**
 * FillOutsideCircle - Fill all pixels outside the region defined
 * by the circle.
 * @param  {} evt The Cornerstone event.
 * @param  {} toolConfiguration Configuration of the tool applying the strategy.
 * @param  {} operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export function fillOutsideCircle(evt, toolConfiguration, operationData) {
  fillCircle(evt, toolConfiguration, operationData, false);
}
