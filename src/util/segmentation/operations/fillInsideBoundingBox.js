import { getBoundingBoxAroundPolygon } from '../boundaries';

export default function fillInsideBoundingBox(
  points,
  segmentationData,
  evt,
  labelValue = 1
) {
  // Loop through all pixels in the segmentation data mask

  // Obtain the bounding box of the entire drawing so that
  // we can subset our search.
  const { image } = evt.detail;
  const { width } = image;
  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices, image);
  const [xMin, yMin] = topLeft;
  const [xMax, yMax] = bottomRight;

  // Loop through all of the points inside the bounding box
  for (let i = xMin; i < xMax; i++) {
    for (let j = yMin; j < yMax; j++) {
      segmentationData[j * width + i] = labelValue;
    }
  }
}
