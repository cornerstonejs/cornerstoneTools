import { getBoundingBoxAroundCircle } from '../boundaries';
import { pointInEllipse } from '../../ellipse';
import fillOutsideBoundingBox from './fillOutsideBoundingBox';
import getCircleCoords from '../../getCircleCoords';

/**
 * FillOutsideCircle - Fill all pixels outside the region defined
 * by the circle.
 * @param  {} evt The Cornerstone event.
 * @param {} evt.operationData An object containing the `pixelData` to
 *                          modify, the `segmentIndex` and the `points` array.
 * @returns {null}
 */
export default function fillOutsideCircle(evt) {
  const eventData = evt.detail;
  const { operationData } = evt;
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

  fillOutsideBoundingBox(evt, topLeft, bottomRight);

  for (let x = xMin; x < xMax; x++) {
    for (let y = yMin; y < yMax; y++) {
      const outside = !pointInEllipse(ellipse, {
        x,
        y,
      });

      if (outside) {
        pixelData[y * width + x] = segmentIndex;
      }
    }
  }
}
