import { getBoundingBoxAroundCircle } from '../boundaries';
import { pointInEllipse } from '../../ellipse';
import fillOutsideBoundingBox from './fillOutsideBoundingBox';
import getCircleCoords from '../../getCircleCoords';

export default function fillOutsideCircle(evt) {
  const eventData = evt.detail;
  const { operationData } = evt;
  const { segmentationData, segmentIndex } = operationData;

  const { image } = eventData;
  const { width } = image;
  const [topLeft, bottomRight] = getBoundingBoxAroundCircle(evt);
  const [xMin, yMin] = topLeft;
  const [xMax, yMax] = bottomRight;
  const ellipse = getCircleCoords(
    eventData.handles.start,
    eventData.handles.end
  );

  // TODO ->

  fillOutsideBoundingBox(evt);

  for (let x = xMin; x < xMax; x++) {
    for (let y = yMin; y < yMax; y++) {
      const outside = !pointInEllipse(ellipse, {
        x,
        y,
      });

      if (outside) {
        segmentationData[y * width + x] = segmentIndex;
      }
    }
  }
}
