import external from '../externalModules.js';
import convertToVector3 from '../util/convertToVector3.js';

/**
 * Projects a patient point to an image point
 * @export @public @method
 * @name projectPatientPointToImagePlane
 *
 * @param  {Object} patientPoint The patient point.
 * @param  {Object} imagePlane   The image plane used for projection.
 * @returns {Object}              The projected coordinates.
 */
export function projectPatientPointToImagePlane(patientPoint, imagePlane) {
  const rowCosines = convertToVector3(imagePlane.rowCosines);
  const columnCosines = convertToVector3(imagePlane.columnCosines);
  const imagePositionPatient = convertToVector3(
    imagePlane.imagePositionPatient
  );
  const point = patientPoint.clone().sub(imagePositionPatient);
  const x = rowCosines.dot(point) / imagePlane.columnPixelSpacing;
  const y = columnCosines.dot(point) / imagePlane.rowPixelSpacing;

  return {
    x,
    y,
  };
}

//
/**
 * Projects an image point to a patient point
 * @export @public @method
 * @name imagePointToPatientPoint
 *
 * @param  {Object} imagePoint   The image point.
 * @param  {Object} imagePlane   The image plane used for projection.
 * @returns {Object}              The projected coordinates.
 */
export function imagePointToPatientPoint(imagePoint, imagePlane) {
  const rowCosines = convertToVector3(imagePlane.rowCosines);
  const columnCosines = convertToVector3(imagePlane.columnCosines);
  const imagePositionPatient = convertToVector3(
    imagePlane.imagePositionPatient
  );

  const x = rowCosines.clone().multiplyScalar(imagePoint.x);

  x.multiplyScalar(imagePlane.columnPixelSpacing);
  const y = columnCosines.clone().multiplyScalar(imagePoint.y);

  y.multiplyScalar(imagePlane.rowPixelSpacing);
  const patientPoint = x.add(y);

  patientPoint.add(imagePositionPatient);

  return patientPoint;
}

/**
 * Returns a rectangle from the imagePlane.
 * @export @public @method
 * @name getRectangleFromImagePlane
 *
 * @param  {Object} imagePlane The imagePlane.
 * @returns {Object} The rect.
 */
function getRectangleFromImagePlane(imagePlane) {
  // Get the points
  const topLeft = imagePointToPatientPoint(
    {
      x: 0,
      y: 0,
    },
    imagePlane
  );
  const topRight = imagePointToPatientPoint(
    {
      x: imagePlane.columns,
      y: 0,
    },
    imagePlane
  );
  const bottomLeft = imagePointToPatientPoint(
    {
      x: 0,
      y: imagePlane.rows,
    },
    imagePlane
  );
  const bottomRight = imagePointToPatientPoint(
    {
      x: imagePlane.columns,
      y: imagePlane.rows,
    },
    imagePlane
  );

  // Get each side as a vector
  const rect = {
    top: new external.cornerstoneMath.Line3(topLeft, topRight),
    left: new external.cornerstoneMath.Line3(topLeft, bottomLeft),
    right: new external.cornerstoneMath.Line3(topRight, bottomRight),
    bottom: new external.cornerstoneMath.Line3(bottomLeft, bottomRight),
  };

  return rect;
}

/**
 * Gets all the intersections of a line with a rect.
 * @private
 * @method
 * @name lineRectangleIntersection
 *
 * @param  {Object} line The line to check.
 * @param  {Object} rect The rect being intersected.
 * @returns {Object[]} An array of the intersections.
 */
function lineRectangleIntersection(line, rect) {
  const intersections = [];

  Object.keys(rect).forEach(function(side) {
    const segment = rect[side];
    const intersection = line.intersectLine(segment);

    if (intersection) {
      intersections.push(intersection);
    }
  });

  return intersections;
}

/**
 * Gets the line of intersection between two planes in patient space.
 * @export @public @method
 * @name planePlaneIntersection
 *
 * @param  {Object} targetImagePlane    The target plane.
 * @param  {Object} referenceImagePlane The reference plane
 * @returns {Object}                   The intersections.
 */
export function planePlaneIntersection(targetImagePlane, referenceImagePlane) {
  const targetRowCosines = convertToVector3(targetImagePlane.rowCosines);
  const targetColumnCosines = convertToVector3(targetImagePlane.columnCosines);
  const targetImagePositionPatient = convertToVector3(
    targetImagePlane.imagePositionPatient
  );
  const referenceRowCosines = convertToVector3(referenceImagePlane.rowCosines);
  const referenceColumnCosines = convertToVector3(
    referenceImagePlane.columnCosines
  );
  const referenceImagePositionPatient = convertToVector3(
    referenceImagePlane.imagePositionPatient
  );

  // First, get the normals of each image plane
  const targetNormal = targetRowCosines.clone().cross(targetColumnCosines);
  const targetPlane = new external.cornerstoneMath.Plane();

  targetPlane.setFromNormalAndCoplanarPoint(
    targetNormal,
    targetImagePositionPatient
  );

  const referenceNormal = referenceRowCosines
    .clone()
    .cross(referenceColumnCosines);
  const referencePlane = new external.cornerstoneMath.Plane();

  referencePlane.setFromNormalAndCoplanarPoint(
    referenceNormal,
    referenceImagePositionPatient
  );

  const originDirection = referencePlane.clone().intersectPlane(targetPlane);
  const origin = originDirection.origin;
  const direction = originDirection.direction;

  // Calculate the longest possible length in the reference image plane (the length of the diagonal)
  const bottomRight = imagePointToPatientPoint(
    {
      x: referenceImagePlane.columns,
      y: referenceImagePlane.rows,
    },
    referenceImagePlane
  );
  const distance = referenceImagePositionPatient.distanceTo(bottomRight);

  // Use this distance to bound the ray intersecting the two planes
  const line = new external.cornerstoneMath.Line3();

  line.start = origin;
  line.end = origin.clone().add(direction.multiplyScalar(distance));

  // Find the intersections between this line and the reference image plane's four sides
  const rect = getRectangleFromImagePlane(referenceImagePlane);
  const intersections = lineRectangleIntersection(line, rect);

  // Return the intersections between this line and the reference image plane's sides
  // In order to draw the reference line from the target image.
  if (intersections.length !== 2) {
    return;
  }

  return {
    start: intersections[0],
    end: intersections[1],
  };
}

/**
 * Translate a point using a rotation angle.
 * @export @public @method
 * @name rotatePoint
 *
 * @param {Object} point - `{ x, y }` in either pixel or canvas coordinates.
 * @param {Object} center - `{ x, y }` in either pixel or canvas coordinates.
 * @param {Number} angle - angle in degrees
 * @returns {Object} - `{ x, y }` new point translated
 */
export function rotatePoint(point, center, angle) {
  const angleRadians = angle * (Math.PI / 180); // Convert to radians

  const rotatedX =
    Math.cos(angleRadians) * (point.x - center.x) -
    Math.sin(angleRadians) * (point.y - center.y) +
    center.x;

  const rotatedY =
    Math.sin(angleRadians) * (point.x - center.x) +
    Math.cos(angleRadians) * (point.y - center.y) +
    center.y;

  return {
    x: rotatedX,
    y: rotatedY,
  };
}
