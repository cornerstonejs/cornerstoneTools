import { getBoundingBoxAroundCircle } from '../boundaries';
import { pointInEllipse } from '../../ellipse';
import getCircleCoords from '../../getCircleCoords';
import isSameSegment from './isSameSegment.js';
import { getLogger } from '../../logger.js';

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
  const { pixelData, segmentIndex, segmentationMixinType } = operationData;

  if (segmentationMixinType !== `circleSegmentationMixin`) {
    logger.error(
      `eraseInsideCircle operation requires circleSegmentationMixin operationData, recieved ${segmentationMixinType}`
    );

    return;
  }

  const eventData = evt.detail;
  const { image } = eventData;
  const { width } = image;
  const [topLeft, bottomRight] = getBoundingBoxAroundCircle(evt);
  const [xMin, yMin] = topLeft;
  const [xMax, yMax] = bottomRight;
  const ellipse = getCircleCoords(
    evt.detail.handles.start,
    evt.detail.handles.end
  );

  for (let x = xMin; x < xMax; x++) {
    for (let y = yMin; y < yMax; y++) {
      const pixelIndex = y * width + x;

      // If the pixel is the same segmentIndex and is inside the
      // Region defined by the array of points, set their value to segmentIndex.
      if (
        isSameSegment(pixelIndex, pixelData, segmentIndex) &&
        pointInEllipse(ellipse, {
          x,
          y,
        })
      ) {
        pixelData[pixelIndex] = 0;
      }
    }
  }
}
