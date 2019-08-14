import { getBoundingBoxAroundCircle } from '../boundaries';
import { pointInEllipse } from '../../ellipse';
import { eraseOutsideBoundingBox } from './index';
import getCircleCoords from '../../getCircleCoords';

export default function eraseOutsideCircle(evt) {
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

  eraseOutsideBoundingBox(evt, topLeft, bottomRight);

  for (let x = xMin; x < xMax; x++) {
    for (let y = yMin; y < yMax; y++) {
      const outside = !pointInEllipse(ellipse, {
        x,
        y,
      });

      if (outside) {
        const pixelIndex = y * width + x;

        if (segmentationData[pixelIndex] === segmentIndex) {
          segmentationData[pixelIndex] = 0;
        }
      }
    }
  }
}
