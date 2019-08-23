import { getBoundingBoxAroundCircle } from '../boundaries';
import { pointInEllipse } from '../../ellipse';
import { eraseOutsideBoundingBox, eraseIfSegmentIndex } from './index';
import getCircleCoords from '../../getCircleCoords';
import isSameSegment from './isSameSegment.js';

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
  const { pixelData, segmentIndex, segmentationMixinType } = operationData;
  const eventData = evt.detail;

  if (segmentationMixinType !== `circleSegmentationMixin`) {
    logger.error(
      `eraseOutsideCircle operation requires circleSegmentationMixin operationData, recieved ${segmentationMixinType}`
    );

    return;
  }

  const { image } = eventData;
  const { width } = image;
  const [topLeft, bottomRight] = getBoundingBoxAroundCircle(evt);
  const [xMin, yMin] = topLeft;
  const [xMax, yMax] = bottomRight;
  const ellipse = getCircleCoords(
    eventData.handles.start,
    eventData.handles.end
  );

  eraseOutsideBoundingBox(evt, operationData, topLeft, bottomRight);

  for (let x = xMin; x < xMax; x++) {
    for (let y = yMin; y < yMax; y++) {
      const pixelIndex = y * width + x;

      if (
        isSameSegment(pixelIndex, pixelData, segmentIndex) &&
        !pointInEllipse(ellipse, {
          x,
          y,
        })
      ) {
        pixelData[pixelIndex] = 0;
      }
    }
  }
}
