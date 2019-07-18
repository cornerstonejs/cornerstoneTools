import { getBoundingBoxAroundCircle } from '../boundaries';
import { pointInEllipse } from '../../ellipse';
import fillOutsideBoundingBox from './fillOutsideBoundingBox';
import getCircleCoords from '../../getCircleCoords';

export default function fillOutsideCircle(
  points,
  segmentationData,
  evt,
  labelValue = 1
) {
  const { image } = evt.detail;
  const { width } = image;
  const [topLeft, bottomRight] = getBoundingBoxAroundCircle(evt);
  const [xMin, yMin] = topLeft;
  const [xMax, yMax] = bottomRight;
  const ellipse = getCircleCoords(
    evt.detail.handles.start,
    evt.detail.handles.end
  );

  fillOutsideBoundingBox(
    topLeft,
    bottomRight,
    segmentationData,
    evt,
    labelValue
  );

  for (let x = xMin; x < xMax; x++) {
    for (let y = yMin; y < yMax; y++) {
      const outside = !pointInEllipse(ellipse, {
        x,
        y,
      });

      if (outside) {
        segmentationData[y * width + x] = labelValue;
      }
    }
  }
}
