import external from './../../../../externalModules.js';

// Move long-axis end point
export default function(proposedPoint, data) {
  const { distance } = external.cornerstoneMath.point;
  const { start, end, perpendicularStart, perpendicularEnd } = data.handles;

  const longLine = {
    start: {
      x: start.x,
      y: start.y,
    },
    end: {
      x: end.x,
      y: end.y,
    },
  };

  const perpendicularLine = {
    start: {
      x: perpendicularStart.x,
      y: perpendicularStart.y,
    },
    end: {
      x: perpendicularEnd.x,
      y: perpendicularEnd.y,
    },
  };

  const intersection = external.cornerstoneMath.lineSegment.intersectLine(
    longLine,
    perpendicularLine
  );

  const distanceFromPerpendicularP1 = distance(
    perpendicularStart,
    intersection
  );
  const distanceFromPerpendicularP2 = distance(perpendicularEnd, intersection);

  const distanceToLineP2 = distance(start, intersection);
  const newLineLength = distance(start, proposedPoint);

  if (newLineLength <= distanceToLineP2) {
    return false;
  }

  const dx = (start.x - proposedPoint.x) / newLineLength;
  const dy = (start.y - proposedPoint.y) / newLineLength;

  const k = distanceToLineP2 / newLineLength;

  const newIntersection = {
    x: start.x + (proposedPoint.x - start.x) * k,
    y: start.y + (proposedPoint.y - start.y) * k,
  };

  perpendicularStart.x = newIntersection.x + distanceFromPerpendicularP1 * dy;
  perpendicularStart.y = newIntersection.y - distanceFromPerpendicularP1 * dx;

  perpendicularEnd.x = newIntersection.x - distanceFromPerpendicularP2 * dy;
  perpendicularEnd.y = newIntersection.y + distanceFromPerpendicularP2 * dx;

  return true;
}
