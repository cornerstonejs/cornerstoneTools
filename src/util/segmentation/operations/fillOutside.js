import { getBoundingBoxAroundPolygon } from '../boundaries';
import pointInPolygon from '../../pointInPolygon';
import { fillOutsideBoundingBox } from './index';

export default function fillOutside(
  points,
  segmentationData,
  evt,
  labelValue = 1
) {
  // Loop through all pixels in the segmentation data mask
  // If they are outside of the region defined by the array of points, set their value to labelValue
  const { image } = evt.detail;
  const { width } = image;
  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices, image);

  // If we know exactly how big the polygon is,
  // we do not need to loop through the whole image.
  //
  // Outside of the polygon bounding box should definitely be filled
  // Inside of the polygon bounding box should be tested with pointInPolygon
  fillOutsideBoundingBox(
    topLeft,
    bottomRight,
    segmentationData,
    evt,
    labelValue
  );

  const [xMin, yMin] = topLeft;
  const [xMax, yMax] = bottomRight;

  // Loop through all of the points inside the bounding box
  for (let i = xMin; i < xMax; i++) {
    for (let j = yMin; j < yMax; j++) {
      const outside = !pointInPolygon([i, j], vertices);

      if (outside) {
        segmentationData[j * width + i] = labelValue;
      }
    }
  }
}
