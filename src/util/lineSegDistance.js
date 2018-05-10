import external from '../externalModules.js';

export default function (element, start, end, coords) {
  const cornerstone = external.cornerstone;

  const lineSegment = {
    start: cornerstone.pixelToCanvas(element, start),
    end: cornerstone.pixelToCanvas(element, end)
  };

  return external.cornerstoneMath.lineSegment.distanceToPoint(lineSegment, coords);
}
