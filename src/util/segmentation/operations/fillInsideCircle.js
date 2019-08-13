import { getBoundingBoxAroundCircle } from '../boundaries';
import { pointInEllipse } from '../../ellipse';
import getCircleCoords from '../../getCircleCoords';

export default function fillInsideCircle(evt) {
  const eventData = evt.detail;
  const { operationData } = evt;
  const { segmentationData, segmentIndex } = operationData;

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
        segmentationData[y * width + x] = segmentIndex;
      }
    }
  }
}
