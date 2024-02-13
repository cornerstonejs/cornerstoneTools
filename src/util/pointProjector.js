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
  const rect = getRectangleFromImagePlane(referenceImagePlane);
  const u = rect.bottom.end
    .clone()
    .sub(rect.bottom.start)
    .normalize();
  const v = rect.left.end
    .clone()
    .sub(rect.left.start)
    .normalize();
  const w = u
    .clone()
    .cross(v)
    .normalize();

  const mat4 = new external.cornerstoneMath.Matrix4(
    u.x,
    u.y,
    u.z,
    0,
    v.x,
    v.y,
    v.z,
    0,
    w.x,
    w.y,
    w.z,
    0,
    0,
    0,
    0,
    1
  );
  const mat4T = new external.cornerstoneMath.Matrix4(
    u.x,
    v.x,
    w.x,
    0,
    u.y,
    v.y,
    w.y,
    0,
    u.z,
    v.z,
    w.z,
    0,
    0,
    0,
    0,
    1
  );
  const aabbBottomLeft = imagePointToPatientPoint(
    {
      x: 0,
      y: 0,
    },
    referenceImagePlane
  )
    .clone()
    .applyMatrix4(mat4);
  const aabbTopRight = imagePointToPatientPoint(
    {
      x: referenceImagePlane.columns,
      y: referenceImagePlane.rows,
    },
    referenceImagePlane
  )
    .clone()
    .applyMatrix4(mat4);

  const originTransf = origin.clone().applyMatrix4(mat4);
  const directionTransf = line.end
    .sub(line.start)
    .clone()
    .applyMatrix4(mat4);

  const intersectionsTransf = intersectRayAABB(
    originTransf.toArray(),
    directionTransf.toArray(),
    [aabbBottomLeft.toArray(), aabbTopRight.toArray()],
    -1000,
    1000
  );

  const intersections = [
    intersectionsTransf[0].clone().applyMatrix4(mat4T),
    intersectionsTransf[1].clone().applyMatrix4(mat4T),
  ];

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

function intersectRayAABB(
  startPoint,
  direction,
  aabb,
  minDistance,
  maxDistance
) {
  // From Ericson, C. (2005). Real-Time Collision Detection (pp. 179-181). Morgan Kaufmann;
  // note the respective errata for t_max/t2: http://realtimecollisiondetection.net/books/rtcd/errata/
  let tMin = minDistance;
  let tMax = maxDistance;

  for (let i = 0; i < 2; i++) {
    if (Math.abs(direction[i]) === 0.0) {
      if (startPoint[i] < aabb[0][i] || startPoint[i] > aabb[1][i]) {
        console.log(
          'direction parallel to edge and starting point outside of aabb => returning'
        );

        return null;
      }
    } else {
      const ood = 1.0 / direction[i];
      let t1 = (aabb[0][i] - startPoint[i]) * ood;
      let t2 = (aabb[1][i] - startPoint[i]) * ood;

      if (t1 > t2) {
        [t1, t2] = [t2, t1]; // Swapping values
      }

      tMin = Math.max(tMin, t1);
      tMax = Math.min(tMax, t2);

      if (tMin > tMax) {
        return null;
      }
    }
  }

  return [
    new external.cornerstoneMath.Vector3(
      startPoint[0] + direction[0] * tMin,
      startPoint[1] + direction[1] * tMin,
      startPoint[2] + direction[2] * tMin
    ),

    new external.cornerstoneMath.Vector3(
      startPoint[0] + direction[0] * tMax,
      startPoint[1] + direction[1] * tMax,
      startPoint[2] + direction[2] * tMax
    ),
  ];
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
