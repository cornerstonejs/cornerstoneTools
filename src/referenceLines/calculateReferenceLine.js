import { planePlaneIntersection, projectPatientPointToImagePlane } from '../util/pointProjector.js';

// Calculates a reference line between two planes by projecting the top left hand corner and bottom right hand corner
// Of the reference image onto the target image.  Ideally we would calculate the intersection between the planes but
// That requires a bit more math and this works fine for most cases
export default function (targetImagePlane, referenceImagePlane) {
  const points = planePlaneIntersection(targetImagePlane, referenceImagePlane);

  if (!points) {
    return;
  }

  return {
    start: projectPatientPointToImagePlane(points.start, targetImagePlane),
    end: projectPatientPointToImagePlane(points.end, targetImagePlane)
  };
}
