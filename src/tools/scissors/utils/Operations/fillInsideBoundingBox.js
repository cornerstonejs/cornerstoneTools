import { getBoundingBoxAroundPolygon } from '../Boundaries';
import { pointInPolygon } from '../PointInside';
import { fillOutsideBoundingBox } from './index';

/**
 * Util Function to Full Fill inside Bounding Boxes
 * @param {array} points The x & y coordinates of the labelMap
 * @param {Object} segmentationData segmentation data
 * @param {Object} image the image loaded on cornerstone canvas
 * @param {number} labelValue
 * @param {boolean} inner
 * @returns {void}
 */
function fillInsideBoundingBox(
  points,
  segmentationData,
  image,
  labelValue = 1,
  inner = true
) {
  // Loop through all pixels in the segmentation data mask

  // Obtain the bounding box of the entire drawing so that
  // we can subset our search. Outside of the bounding box,
  // everything is outside of the polygon.
  const { width, height } = image;
  const vertices = points.map(a => [a.x, a.y]);
  // TODO add a way to choose when it's a circle or a rectangle strategy
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices);

  // eslint-disable-next-line
  console.log(`topLeft: ${topLeft}, bottomRight: ${bottomRight}`);
  const [xMin, yMin] = topLeft;
  const [xMax, yMax] = bottomRight;

  let painted = inner
    ? 0
    : fillOutsideBoundingBox(
        topLeft,
        bottomRight,
        segmentationData,
        width,
        height,
        labelValue
      );
  // Loop through all of the points inside the bounding box

  for (let i = xMin; i < xMax; i++) {
    for (let j = yMin; j < yMax; j++) {
      if (inner) {
        // If they are inside of the region defined by the array of points, set their value to labelValue
        const inside = pointInPolygon([i, j], vertices);

        if (inside) {
          segmentationData[j * width + i] = labelValue;
          painted++;
        }
      }

      if (!inner) {
        // If they are outside of the region defined by the array of points, set their value to 0
        const outside = !pointInPolygon([i, j], vertices);

        if (outside) {
          segmentationData[j * width + i] = labelValue;
          painted++;
        }
      }
    }
  }
  // eslint-disable-next-line
  console.log(`painted: ${painted}`);
}

export default fillInsideBoundingBox;
