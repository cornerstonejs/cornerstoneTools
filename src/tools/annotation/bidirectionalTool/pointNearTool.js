import external from '../../externalModules.js';
import pointInsideBoundingBox from '../../util/pointInsideBoundingBox.js';

const pointNearPerpendicular = (element, handles, coords, distanceThreshold) => {
  const cornerstone = external.cornerstone;
  const cornerstoneMath = external.cornerstoneMath;
  const lineSegment = {
    start: cornerstone.pixelToCanvas(element, handles.perpendicularStart),
    end: cornerstone.pixelToCanvas(element, handles.perpendicularEnd)
  };

  const distanceToPoint = cornerstoneMath.lineSegment.distanceToPoint(lineSegment, coords);

  return (distanceToPoint < distanceThreshold);
};

export default function (element, data, coords) {
  const cornerstone = external.cornerstone;
  const cornerstoneMath = external.cornerstoneMath;
  const { handles } = data;
  const lineSegment = {
    start: cornerstone.pixelToCanvas(element, handles.start),
    end: cornerstone.pixelToCanvas(element, handles.end)
  };

  const distanceToPoint = cornerstoneMath.lineSegment.distanceToPoint(lineSegment, coords);

  if (pointInsideBoundingBox(handles.textBox, coords)) {
    return true;
  }

  if (pointNearPerpendicular(element, handles, coords, this.configuration.distanceThreshold)) {
    return true;
  }

  return (distanceToPoint < this.configuration.distanceThreshold);
}
