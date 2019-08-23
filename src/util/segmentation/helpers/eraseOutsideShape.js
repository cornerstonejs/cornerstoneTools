import { eraseOutsideBoundingBox } from '../operations/index';
import isSameSegment from './isSameSegment.js';

import { getLogger } from '../../logger.js';

const logger = getLogger('util:segmentation:operations:eraseOutsideCircle');

/**
 * Erase all pixels labeled with the activeSegmentIndex,
 * outside the region defined by the shape.
 * @param  {Object} evt The Cornerstone event.
 * @param {Object}  operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @param {Object} pointInShape - A function that checks if a point, x,y is within a shape.
 * @param {number[]} topLeft The top left of the bounding box.
 * @param {number[]} bottomRight The bottom right of the bounding box.
 * @returns {null}
 */
export default function eraseOutsideShape(
  evt,
  operationData,
  pointInShape,
  topLeft,
  bottomRight
) {
  const { width } = evt.detail.image;
  const { pixelData, segmentIndex } = operationData;
  const [xMin, yMin] = topLeft;
  const [xMax, yMax] = bottomRight;

  eraseOutsideBoundingBox(evt, operationData, topLeft, bottomRight);

  for (let x = xMin; x < xMax; x++) {
    for (let y = yMin; y < yMax; y++) {
      const pixelIndex = y * width + x;

      // If the pixel is the same segmentIndex and is inside the
      // Region defined by the array of points, set their value to segmentIndex.
      if (
        isSameSegment(pixelIndex, pixelData, segmentIndex) &&
        !pointInShape({
          x,
          y,
        })
      ) {
        pixelData[pixelIndex] = 0;
      }
    }
  }
}
