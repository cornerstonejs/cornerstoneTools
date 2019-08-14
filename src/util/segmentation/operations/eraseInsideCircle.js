import { getBoundingBoxAroundCircle } from '../boundaries';
import { pointInEllipse } from '../../ellipse';
import getCircleCoords from '../../getCircleCoords';

/**
 * EraseInsideCircle - Erase all pixels labeled with the activeSegmentIndex,
 * in the region defined by the circle.
 * @param  {} evt The Cornerstone event.
 * @param {} evt.operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export default function eraseInsideCircle(evt) {
  const eventData = evt.detail;
  const { operationData } = evt;
  const { pixelData, segmentIndex } = operationData;

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
      const inside = pointInEllipse(ellipse, {
        x,
        y,
      });

      if (inside) {
        const pixelIndex = y * width + x;

        if (pixelData[pixelIndex] === segmentIndex) {
          pixelData[pixelIndex] = 0;
        }
      }
    }
  }
}
