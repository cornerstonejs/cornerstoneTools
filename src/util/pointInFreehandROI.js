function isEnclosedY (yp, y1, y2) {
  if ((y1 < yp && yp < y2) || (y2 < yp && yp < y1)) {
    return true;
  }

  return false;
}

function isLineRightOfPoint (point, lp1, lp2) {
  // If both right of point return true
  if (lp1.x > point.x && lp2.x > point.x) {
    return true;
  }
  // Put leftmost point in lp1
  if (lp1.x > lp2.x) {
    const lptemp = lp1;

    lp1 = lp2;
    lp2 = lptemp;
  }
  const lPointY = lineSegmentAtPoint(point, lp1, lp2);

  // If the lp1.x and lp2.x enclose point.x check gradient of line and see if
  // Point is above or below the line to calculate if it inside.
  if (Math.sign(lPointY.gradient) * point.y > lPointY.value) {
    return true;
  }

  return false;
}

function lineSegmentAtPoint (point, lp1, lp2) {
  const dydx = (lp2.y - lp1.y) / (lp2.x - lp1.x);
  const fx = {
    value: lp1.x + dydx * (point.x - lp1.x),
    gradient: dydx
  };

  return fx;
}

export default function (dataHandles, location) {
  // JPETTS - Calculates if "point" is inside the polygon defined by dataHandles by
  // Counting the number of times a ray originating from "point" crosses the
  // Edges of the polygon. Odd === inside, Even === outside.

  // The bool "inROI" flips every time ray originating from location and
  // Pointing to the right crosses a linesegment.
  let inROI = false;

  // Cycle round pairs of points
  let j = dataHandles.length - 1; // The last vertex is the previous one to the first

  for (let i = 0; i < dataHandles.length; i++) {
    // Check if y values of line encapsulate location.y
    if (isEnclosedY(location.y, dataHandles[i].y, dataHandles[j].y)) {
      if (isLineRightOfPoint(location, dataHandles[i], dataHandles[j])) {
        inROI = !inROI;
      }
    }

    j = i; // Here j is previous vertex to i
  }

  return inROI;
}
