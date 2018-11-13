/**
 * Orientation algoritm to determine if two lines cross.
 * Credit and details: geeksforgeeks.org/check-if-two-given-line-segments-intersect/
 */

/**
 * Determines whether a new handle causes an intersection of the lines of the polygon.
 * @public
 * @function newHandle
 *
 * @param {Object} candidateHandle The new handle to check.
 * @param {Object} dataHandles data object associated with the tool.
 * @returns {boolean} - Whether the new line intersects with any other lines of the polygon.
 */
function newHandle(candidateHandle, dataHandles) {
  // Check if the proposed line will intersect any existent line
  const lastHandleId = dataHandles.length - 1;
  const lastHandle = getCoords(dataHandles[lastHandleId]);
  const newHandle = getCoords(candidateHandle);

  return doesIntersectOtherLines(dataHandles, lastHandle, newHandle, [
    lastHandleId,
  ]);
}

/**
 * Checks if the last line of a polygon will intersect the other lines of the polgyon.
 * @public
 * @function end
 *
 * @param {Object} dataHandles data object associated with the tool.
 * @returns {boolean} Whether the last line intersects with any other lines of the polygon.
 */
function end(dataHandles) {
  const lastHandleId = dataHandles.length - 1;
  const lastHandle = getCoords(dataHandles[lastHandleId]);
  const firstHandle = getCoords(dataHandles[0]);

  return doesIntersectOtherLines(dataHandles, lastHandle, firstHandle, [
    lastHandleId,
    0,
  ]);
}

/**
 * Checks whether the modification of a handle's position causes intersection of the lines of the polygon.
 * @public
 * @method modify
 *
 * @param {Object} dataHandles Data object associated with the tool.
 * @param {number} modifiedHandleId The id of the handle being modified.
 * @returns {boolean} Whether the modfication causes any intersections.
 */
function modify(dataHandles, modifiedHandleId) {
  // Check if the modifiedHandle's previous and next lines will intersect any other line in the polygon
  const modifiedHandle = getCoords(dataHandles[modifiedHandleId]);

  // Previous neightbor handle
  let neighborHandleId = modifiedHandleId - 1;

  if (modifiedHandleId === 0) {
    neighborHandleId = dataHandles.length - 1;
  }

  let neighborHandle = getCoords(dataHandles[neighborHandleId]);

  if (
    doesIntersectOtherLines(dataHandles, modifiedHandle, neighborHandle, [
      modifiedHandleId,
      neighborHandleId,
    ])
  ) {
    return true;
  }

  // Next neightbor handle
  if (modifiedHandleId === dataHandles.length - 1) {
    neighborHandleId = 0;
  } else {
    neighborHandleId = modifiedHandleId + 1;
  }

  neighborHandle = getCoords(dataHandles[neighborHandleId]);

  return doesIntersectOtherLines(dataHandles, modifiedHandle, neighborHandle, [
    modifiedHandleId,
    neighborHandleId,
  ]);
}

/**
 * Checks whether the line (p1,q1) intersects any of the other lines in the polygon.
 * @private
 * @function doesIntersectOtherLines
 *
 * @param {Object} dataHandles Data object associated with the tool.
 * @param {Object} p1 Coordinates of the start of the line.
 * @param {Object} q1 Coordinates of the end of the line.
 * @param {Object} ignoredHandleIds Ids of handles to ignore (i.e. lines that share a vertex with the line being tested).
 * @returns {boolean} Whether the line intersects any of the other lines in the polygon.
 */
function doesIntersectOtherLines(dataHandles, p1, q1, ignoredHandleIds) {
  let j = dataHandles.length - 1;

  for (let i = 0; i < dataHandles.length; i++) {
    if (
      ignoredHandleIds.indexOf(i) !== -1 ||
      ignoredHandleIds.indexOf(j) !== -1
    ) {
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

/**
 * Checks whether the line (p1,q1) intersects the line (p2,q2) via an orientation algorithm.
 * @private
 * @function doesIntersect
 *
 * @param {Object} p1 Coordinates of the start of the line 1.
 * @param {Object} q1 Coordinates of the end of the line 1.
 * @param {Object} p2 Coordinates of the start of the line 2.
 * @param {Object} q2 Coordinates of the end of the line 2.
 * @returns {boolean} Whether lines (p1,q1) and (p2,q2) intersect.
 */
function doesIntersect(p1, q1, p2, q2) {
  let result = false;

  const orient = [
    orientation(p1, q1, p2),
    orientation(p1, q1, q2),
    orientation(p2, q2, p1),
    orientation(p2, q2, q1),
  ];

  // General Case
  if (orient[0] !== orient[1] && orient[2] !== orient[3]) {
    return true;
  }

  // Special Cases
  if (orient[0] === 0 && onSegment(p1, p2, q1)) {
    // If p1, q1 and p2 are colinear and p2 lies on segment p1q1
    result = true;
  } else if (orient[1] === 0 && onSegment(p1, q2, q1)) {
    // If p1, q1 and p2 are colinear and q2 lies on segment p1q1
    result = true;
  } else if (orient[2] === 0 && onSegment(p2, p1, q2)) {
    // If p2, q2 and p1 are colinear and p1 lies on segment p2q2
    result = true;
  } else if (orient[3] === 0 && onSegment(p2, q1, q2)) {
    // If p2, q2 and q1 are colinear and q1 lies on segment p2q2
    result = true;
  }

  return result;
}

/**
 * Returns an object with two properties, x and y, from a heavier FreehandHandleData object.
 * @private
 * @function getCoords
 *
 * @param {Object} dataHandle Data object associated with a single handle in the freehand tool.
 * @returns {Object} An object containing position propeties x and y.
 */
function getCoords(dataHandle) {
  return {
    x: dataHandle.x,
    y: dataHandle.y,
  };
}

/**
 * Checks the orientation of 3 points.
 * @private
 * @function orientation
 *
 * @param {Object} p First point.
 * @param {Object} q Second point.
 * @param {Object} r Third point.
 * @returns {number} - 0: Colinear, 1: Clockwise, 2: Anticlockwise
 */
function orientation(p, q, r) {
  const orientationValue =
    (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

  if (orientationValue === 0) {
    return 0; // Colinear
  }

  return orientationValue > 0 ? 1 : 2;
}

/**
 * Checks if point q lines on the segment (p,r).
 * @private
 * @function onSegment
 *
 * @param {Object} p Point p.
 * @param {Object} q Point q.
 * @param {Object} r Point r.
 * @returns {boolean} - If q lies on line segment (p,r).
 */
function onSegment(p, q, r) {
  if (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  ) {
    return true;
  }

  return false;
}

export default {
  newHandle,
  end,
  modify,
};
