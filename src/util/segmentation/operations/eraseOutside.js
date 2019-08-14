import { getBoundingBoxAroundPolygon } from '../boundaries';
import pointInPolygon from '../../pointInPolygon';
import { eraseOutsideBoundingBox } from './index';

export default function eraseOutside(evt) {
  const eventData = evt.detail;
  const { operationData } = evt;
  const { segmentationData, segmentIndex, points } = operationData;

  // Loop through all pixels in the segmentation data mask
  // If they are outside of the region defined by the array of points, set their value to segmentIndex
  const { image } = eventData;
  const { width } = image;
  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices, image);

  // If we know exactly how big the polygon is,
  // we do not need to loop through the whole image.
  //
  // Outside of the polygon bounding box should definitely be filled
  // Inside of the polygon bounding box should be tested with pointInPolygon
  eraseOutsideBoundingBox(evt, topLeft, bottomRight);

  const [xMin, yMin] = topLeft;
  const [xMax, yMax] = bottomRight;

  // Loop through all of the points inside the bounding box
  for (let i = xMin; i < xMax; i++) {
    for (let j = yMin; j < yMax; j++) {
      const outside = !pointInPolygon([i, j], vertices);

      if (outside) {
        const pixelIndex = j * width + i;

        if (segmentationData[pixelIndex] === segmentIndex) {
          segmentationData[pixelIndex] = 0;
        }
      }
    }
  }
}
