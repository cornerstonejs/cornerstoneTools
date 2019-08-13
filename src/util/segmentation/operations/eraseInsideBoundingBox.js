import { getBoundingBoxAroundPolygon } from '../boundaries';

export default function eraseInsideBoundingBox(evt) {
  const eventData = evt.detail;
  const { operationData } = evt;
  const { points, segmentationData, segmentIndex } = operationData;

  // Loop through all pixels in the segmentation data mask

  // Obtain the bounding box of the entire drawing so that
  // we can subset our search.
  const { image } = eventData;
  const { width } = image;
  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices, image);
  const [xMin, yMin] = topLeft;
  const [xMax, yMax] = bottomRight;

  // Loop through all of the points inside the bounding box
  for (let i = xMin; i < xMax; i++) {
    for (let j = yMin; j < yMax; j++) {
      const pixelIndex = j * width + i;
      if (segmentationData[pixelIndex] === segmentIndex) {
        segmentationData[pixelIndex] = 0;
      }
    }
  }
}
