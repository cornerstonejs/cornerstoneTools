// JPETTS orientation algoritm to determine if two lines cross.
// Credit and details: geeksforgeeks.org/check-if-two-given-line-segments-intersect/

function freeHandIntersect (newHandle, dataHandles) {
  // Here (p1,p2) is the new line proposed by the user.
  const k = dataHandles.length - 1;
  const p1 = {
    x: dataHandles[k].x,
    y: dataHandles[k].y
  };
  const q1 = {
    x: newHandle.x,
    y: newHandle.y
  };

  if (doesInteresctOtherLines(dataHandles, p1, q1, k)) {

    return true;
  }

  return false;
}

function freeHandIntersectEnd (dataHandles) {
  // Check if line (dataHandles.length -1, 0) intersects with other lines.
  const k = dataHandles.length - 1;
  const l = 0;
  const p1 = {
    x: dataHandles[k].x,
    y: dataHandles[k].y
  };
  const q1 = {
    x: dataHandles[l].x,
    y: dataHandles[l].y
  };

  if (doesInteresctOtherLines(dataHandles, p1, q1, k, l)) {

    return true;
  }

  return false;
}

function freeHandIntersectModify (dataHandles, k) {
  // Check if line (k, k-1) intersects with other lines
  // Where k is the id of the handle being modified.
  let l = k - 1;

  // If k is first node, previous node === final node
  if (k === 0) {
    l = dataHandles.length - 1;
  }

  const p1 = {
    x: dataHandles[k].x,
    y: dataHandles[k].y
  };

  const q1 = {
    x: dataHandles[l].x,
    y: dataHandles[l].y
  };

  if (doesInteresctOtherLines(dataHandles, p1, q1, k, l)) {

    return true;
  }

  // Check if line (k, k+1) intersects with other lines
  l = k + 1;
  // If k is last node, l === first node
  if (k === dataHandles.length - 1) {
    l = 0;
  }

  q1.x = dataHandles[l].x;
  q1.y = dataHandles[l].y;

  if (doesInteresctOtherLines(dataHandles, p1, q1, k, l)) {

    return true;
  }

  return false;
}


function doesInteresctOtherLines (dataHandles, p1, q1, k, l) {
  let j = dataHandles.length - 1;

  for (let i = 0; i < dataHandles.length; i++) {

    // Ignore lines with node common to subject line
    if (i === k || j === k || i === l || j === l) {
      j = i;
      continue;
    }

    const p2 = {
      x: dataHandles[j].x,
      y: dataHandles[j].y
    };
    const q2 = {
      x: dataHandles[i].x,
      y: dataHandles[i].y
    };

    if (doesIntersect(p1, q1, p2, q2)) {
      return true;
    }

    j = i;
  }

  return false;

}

function doesIntersect (p1, q1, p2, q2) {
  // Check orientation of points in order to determine
  // If (p1,q1) and (p2,q2) intersect

  const orient = [
    orientation(p1, q1, p2),
    orientation(p1, q1, q2),
    orientation(p2, q2, p1),
    orientation(p2, q2, q1)
  ];

  // General Case
  if (orient[0] !== orient[1] && orient[2] !== orient[3]) {

    return true;
  }

  // Special Cases
  if (orient[0] === 0 && onSegment(p1, p2, q1)) { // If p1, q1 and p2 are colinear and p2 lies on segment p1q1

    return true;
  }

  if (orient[1] === 0 && onSegment(p1, q2, q1)) { // If p1, q1 and p2 are colinear and q2 lies on segment p1q1

    return true;
  }

  if (orient[2] === 0 && onSegment(p2, p1, q2)) { // If p2, q2 and p1 are colinear and p1 lies on segment p2q2

    return true;
  }

  if (orient[3] === 0 && onSegment(p2, q1, q2)) { // If p2, q2 and q1 are colinear and q1 lies on segment p2q2

    return true;
  }

  return false;
}

function orientation (p, q, r) {
  const orientationValue = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

  if (orientationValue === 0) {
    return 0; // Colinear
  }

  return (orientationValue > 0) ? 1 : 2; // Clockwise or anticlockwise
}

function onSegment (p, q, r) {

  if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
      q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) {
    return true;
  }

  return false;
}

export {
  freeHandIntersect,
  freeHandIntersectEnd,
  freeHandIntersectModify
};
