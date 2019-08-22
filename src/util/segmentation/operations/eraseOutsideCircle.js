import { getBoundingBoxAroundCircle } from '../boundaries';
import { pointInEllipse } from '../../ellipse';
import { eraseOutsideBoundingBox, eraseIfSegmentIndex } from './index';
import getCircleCoords from '../../getCircleCoords';

import { getLogger } from '../../logger.js';

const logger = getLogger('util:segmentation:operations:eraseOutsideCircle');

/**
 * EraseOutsideCircle - Erase all pixels labeled with the activeSegmentIndex,
 * outside the region defined by the circle.
 * @param  {} evt The Cornerstone event.
 * @param {} evt.operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export default function eraseOutsideCircle(evt) {
  const eventData = evt.detail;
  const { operationData } = evt;

  if (operationData.segmentationMixinType !== `circleSegmentationMixin`) {
    logger.error(
      `eraseOutsideCircle operation requires circleSegmentationMixin operationData, recieved ${
        operationData.segmentationMixinType
      }`
    );

    return;
  }

  const { pixelData, segmentIndex } = operationData;

  const { image } = eventData;
  const { width } = image;
  const [topLeft, bottomRight] = getBoundingBoxAroundCircle(evt);
  const [xMin, yMin] = topLeft;
  const [xMax, yMax] = bottomRight;
  const ellipse = getCircleCoords(
    eventData.handles.start,
    eventData.handles.end
  );

  eraseOutsideBoundingBox(evt, topLeft, bottomRight);

  for (let x = xMin; x < xMax; x++) {
    for (let y = yMin; y < yMax; y++) {
      const outside = !pointInEllipse(ellipse, {
        x,
        y,
      });

      if (outside) {
        eraseIfSegmentIndex(y * width + x, pixelData, segmentIndex);
      }
    }
  }
}
