import { planePlaneIntersection, projectPatientPointToImagePlane } from '../util/pointProjector.js';

// calculates a reference line between two planes by projecting the top left hand corner and bottom right hand corner
// of the reference image onto the target image.  Ideally we would calculate the intersection between the planes but
// that requires a bit more math and this works fine for most cases
export default function (targetImagePlane, referenceImagePlane) {
    var points = planePlaneIntersection(targetImagePlane, referenceImagePlane);
    if (!points) {
        return;
    }

    return {
        start: projectPatientPointToImagePlane(points.start, targetImagePlane),
        end: projectPatientPointToImagePlane(points.end, targetImagePlane)
    };
}
