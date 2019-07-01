import { getBoundingBoxAroundPolygon } from '../Boundaries';
import { pointInPolygon } from '../PointInside';

import { getLogger } from '../../../../util/logger.js';

const logger = getLogger('tools:ScissorsTool');

export default function fillInside(
  points,
  segmentationData,
  image,
  labelValue = 1
) {
  // Loop through all pixels in the segmentation data mask

  // Obtain the bounding box of the entire drawing so that
  // we can subset our search. Outside of the bounding box,
  // everything is outside of the polygon.
  const { width } = image;
  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices);

  const [xMin, yMin] = topLeft;
  const [xMax, yMax] = bottomRight;

  let painted = 0;

  // Loop through all of the points inside the bounding box
  for (let i = xMin; i < xMax; i++) {
    for (let j = yMin; j < yMax; j++) {
      // If they are inside of the region defined by the array of points, set their value to labelValue
      const inside = pointInPolygon([i, j], vertices);

      if (inside) {
        segmentationData[j * width + i] = labelValue;
        painted++;
      }
    }
  }

  logger.warn(painted);
}
