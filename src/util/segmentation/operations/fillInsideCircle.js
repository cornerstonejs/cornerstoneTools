import { getBoundingBoxAroundCircle } from '../boundaries';
import { pointInEllipse } from '../../ellipse';
import getCircleCoords from '../../getCircleCoords';

export default function fillInsideCircle(
  points,
  segmentationData,
  evt,
  labelValue = 1
) {
  const { width } = evt.detail.image;
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
        segmentationData[y * width + x] = labelValue;
      }
    }
  }
}
