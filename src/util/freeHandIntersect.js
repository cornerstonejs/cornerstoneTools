// JPETTS orientation algoritm to determine if two lines cross.
// Credit and details: geeksforgeeks.org/check-if-two-given-line-segments-intersect/

function freeHandIntersect (newHandle, dataHandles) {
  // Check if the proposed line will intersect any existent line
  const lastHandleId = dataHandles.length - 1;
  const lastNode = getCoords(dataHandles[lastHandleId]);
  const newNode = getCoords(newHandle);

  return doesIntersectOtherLines(dataHandles, lastNode, newNode, [lastHandleId]);
}

function freeHandIntersectEnd (dataHandles) {
  // Check if the last line will overlap another line.
  const lastHandleId = dataHandles.length - 1;
  const lastNode = getCoords(dataHandles[lastHandleId]);
  const firstNode = getCoords(dataHandles[0]);

  return doesIntersectOtherLines(dataHandles, lastNode, firstNode, [lastHandleId, 0]);
}

function freeHandIntersectModify (dataHandles, modifiedHandleId) {
  // Check if the modifiedHandle's previous and next lines will intersect any other line in the polygon
  const modifiedNode = getCoords(dataHandles[modifiedHandleId]);

  // Previous neightbor handle
  let neighborHandleId = modifiedHandleId - 1;

  if (modifiedHandleId === 0) {
    neighborHandleId = dataHandles.length - 1;
  }

  let neighborNode = getCoords(dataHandles[neighborHandleId]);

  if (doesIntersectOtherLines(dataHandles, modifiedNode, neighborNode, [modifiedHandleId, neighborHandleId])) {
    return true;
  }

  // Next neightbor handle
  if (modifiedHandleId === dataHandles.length - 1) {
    neighborHandleId = 0;
  } else {
    neighborHandleId = modifiedHandleId + 1;
  }

  neighborNode = getCoords(dataHandles[neighborHandleId]);

  return doesIntersectOtherLines(dataHandles, modifiedNode, neighborNode, [modifiedHandleId, neighborHandleId]);
}

function doesIntersectOtherLines (dataHandles, p1, q1, ignoredHandleIds) {
  let j = dataHandles.length - 1;

  for (let i = 0; i < dataHandles.length; i++) {

    if (ignoredHandleIds.indexOf(i) !== -1 || ignoredHandleIds.indexOf(j) !== -1) {
      j = i;
      continue;
    }

    const p2 = getCoords(dataHandles[j]);
    const q2 = getCoords(dataHandles[i]);

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
  let result = false;

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
    result = true;
  } else if (orient[1] === 0 && onSegment(p1, q2, q1)) { // If p1, q1 and p2 are colinear and q2 lies on segment p1q1
    result = true;
  } else if (orient[2] === 0 && onSegment(p2, p1, q2)) { // If p2, q2 and p1 are colinear and p1 lies on segment p2q2
    result = true;
  } else if (orient[3] === 0 && onSegment(p2, q1, q2)) { // If p2, q2 and q1 are colinear and q1 lies on segment p2q2
    result = true;
  }

  return result;
}

function getCoords (dataHandle) {
  return {
    x: dataHandle.x,
    y: dataHandle.y
  };
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
