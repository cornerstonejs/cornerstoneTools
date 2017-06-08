import * as cornerstoneMath from 'cornerstone-math';

// Projects a patient point to an image point
export function projectPatientPointToImagePlane (patientPoint, imagePlane) {
  const point = patientPoint.clone().sub(imagePlane.imagePositionPatient);
  const x = imagePlane.rowCosines.dot(point) / imagePlane.columnPixelSpacing;
  const y = imagePlane.columnCosines.dot(point) / imagePlane.rowPixelSpacing;


  return {
    x,
    y
  };
}

// Projects an image point to a patient point
export function imagePointToPatientPoint (imagePoint, imagePlane) {
  const x = imagePlane.rowCosines.clone().multiplyScalar(imagePoint.x);

  x.multiplyScalar(imagePlane.columnPixelSpacing);
  const y = imagePlane.columnCosines.clone().multiplyScalar(imagePoint.y);

  y.multiplyScalar(imagePlane.rowPixelSpacing);
  const patientPoint = x.add(y);

  patientPoint.add(imagePlane.imagePositionPatient);

  return patientPoint;
}

function getRectangleFromImagePlane (imagePlane) {
    // Get the points
  const topLeft = imagePointToPatientPoint({
    x: 0,
    y: 0
  }, imagePlane);
  const topRight = imagePointToPatientPoint({
    x: imagePlane.columns,
    y: 0
  }, imagePlane);
  const bottomLeft = imagePointToPatientPoint({
    x: 0,
    y: imagePlane.rows
  }, imagePlane);
  const bottomRight = imagePointToPatientPoint({
    x: imagePlane.columns,
    y: imagePlane.rows
  }, imagePlane);

    // Get each side as a vector
  const rect = {
    top: new cornerstoneMath.Line3(topLeft, topRight),
    left: new cornerstoneMath.Line3(topLeft, bottomLeft),
    right: new cornerstoneMath.Line3(topRight, bottomRight),
    bottom: new cornerstoneMath.Line3(bottomLeft, bottomRight)
  };


  return rect;
}

function lineRectangleIntersection (line, rect) {
  const intersections = [];

  Object.keys(rect).forEach(function (side) {
    const segment = rect[side];
    const intersection = line.intersectLine(segment);

    if (intersection) {
      intersections.push(intersection);
    }
  });

  return intersections;
}

export function planePlaneIntersection (targetImagePlane, referenceImagePlane) {
    // Gets the line of intersection between two planes in patient space

    // First, get the normals of each image plane
  const targetNormal = targetImagePlane.rowCosines.clone().cross(targetImagePlane.columnCosines);
  const targetPlane = new cornerstoneMath.Plane();

  targetPlane.setFromNormalAndCoplanarPoint(targetNormal, targetImagePlane.imagePositionPatient);

  const referenceNormal = referenceImagePlane.rowCosines.clone().cross(referenceImagePlane.columnCosines);
  const referencePlane = new cornerstoneMath.Plane();

  referencePlane.setFromNormalAndCoplanarPoint(referenceNormal, referenceImagePlane.imagePositionPatient);

  const originDirection = referencePlane.clone().intersectPlane(targetPlane);
  const origin = originDirection.origin;
  const direction = originDirection.direction;

    // Calculate the longest possible length in the reference image plane (the length of the diagonal)
  const bottomRight = imagePointToPatientPoint({
    x: referenceImagePlane.columns,
    y: referenceImagePlane.rows
  }, referenceImagePlane);
  const distance = referenceImagePlane.imagePositionPatient.distanceTo(bottomRight);

    // Use this distance to bound the ray intersecting the two planes
  const line = new cornerstoneMath.Line3();

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
    end: intersections[1]
  };
}
