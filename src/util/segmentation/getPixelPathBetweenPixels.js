import external from '../../externalModules.js';

const oneOverRoot2 = 1 / Math.sqrt(2); // Cache this to avoid repeated computation.

const DIRECTIONS = {
  up: {
    x: 0,
    y: 1,
  },
  upRight: {
    x: oneOverRoot2,
    y: oneOverRoot2,
  },
  right: {
    x: 1,
    y: 0,
  },
  downRight: {
    x: oneOverRoot2,
    y: -oneOverRoot2,
  },
  down: {
    x: 0,
    y: 1,
  },
  downLeft: {
    x: -oneOverRoot2,
    y: -oneOverRoot2,
  },
  left: {
    x: -1,
    y: 0,
  },
  upLeft: {
    x: -oneOverRoot2,
    y: oneOverRoot2,
  },
};

/**
 * GetPixelPathBetweenPixels - Generates a 1-pixel wide path of pixels between two pixels.
 * This is essentially simplified A* pathfinding, as we know there are no "obstacles".
 *
 * @param  {Object} p1 The starting pixel
 * @param  {Object} p2 The end pixel.
 *
 * @returns {Object[]} All of the pixels on the shortest path between p1 and p2.
 */
export default function(p1, p2) {
  const p = {
    x: p1.x,
    y: p1.y,
  };

  const path = [];

  while (p2.x !== p.x || p2.y !== p.y) {
    if (p2.x === p.x) {
      // Goal is above or bellow us.
      if (p2.y > p.y) {
        p.y++;
      } else {
        p.y--;
      }
    } else if (p2.y === p.y) {
      // Goal is to the left or right of us.
      if (p2.x > p.x) {
        p.x++;
      } else {
        p.x--;
      }
    } else if (p2.y > p.y) {
      if (p2.x > p.x) {
        // Can go up, right or diagonally up-right towards goal.
        moveUpRight(p, p2);
      } else {
        // Can go up, left, or diagonally up-left towards goal.
        moveUpLeft(p, p2);
      }
    } else if (p2.x > p.x) {
      // Can go down, right, or diagonally down-right towards goal.
      moveDownRight(p, p2);
    } else {
      // Can go down, left, or diagonally down-left towards goal.
      moveDownLeft(p, p2);
    }

    path.push({
      x: p.x,
      y: p.y,
    });
  }

  path.pop(); // Remove last node as is the same as the destination.

  return path;
}

/**
 * MoveUpRight - Moves p up, right or diagonally up right towards p2.
 * @param  {Object} p
 * @param  {Object} p2
 *
 * @returns {null}
 */
function moveUpRight(p, p2) {
  const unitVector = unitVectorFromPtoP2(p, p2);

  // Largest dot product is fastest way to travel.
  const dotProducts = [
    dotProduct2D(unitVector, DIRECTIONS.up),
    dotProduct2D(unitVector, DIRECTIONS.right),
    dotProduct2D(unitVector, DIRECTIONS.upRight),
  ];

  const largestIndex = getIndexOfLargestInLengthThreeArray(dotProducts);

  switch (largestIndex) {
    case 0:
      p.y++;
      break;
    case 1:
      p.x++;
      break;
    case 2:
      p.y++;
      p.x++;
  }
}

/**
 * MoveUpLeft - Moves p up, left or diagonally up left towards p2.
 * @param  {Object} p
 * @param  {Object} p2
 *
 * @returns {null}
 */
function moveUpLeft(p, p2) {
  const unitVector = unitVectorFromPtoP2(p, p2);

  // Largest dot product is fastest way to travel.
  const dotProducts = [
    dotProduct2D(unitVector, DIRECTIONS.up),
    dotProduct2D(unitVector, DIRECTIONS.left),
    dotProduct2D(unitVector, DIRECTIONS.upLeft),
  ];

  const largestIndex = getIndexOfLargestInLengthThreeArray(dotProducts);

  switch (largestIndex) {
    case 0:
      p.y++;
      break;
    case 1:
      p.x--;
      break;
    case 2:
      p.y++;
      p.x--;
  }
}

/**
 * MoveDownRight - Moves p down, right or diagonally down right towards p2.
 * @param  {Object} p
 * @param  {Object} p2
 *
 * @returns {null}
 */
function moveDownRight(p, p2) {
  const unitVector = unitVectorFromPtoP2(p, p2);

  // Largest dot product is fastest way to travel.
  const dotProducts = [
    dotProduct2D(unitVector, DIRECTIONS.down),
    dotProduct2D(unitVector, DIRECTIONS.right),
    dotProduct2D(unitVector, DIRECTIONS.downRight),
  ];

  const largestIndex = getIndexOfLargestInLengthThreeArray(dotProducts);

  switch (largestIndex) {
    case 0:
      p.y--;
      break;
    case 1:
      p.x++;
      break;
    case 2:
      p.y--;
      p.x++;
  }
}

/**
 * MoveDownLeft - Moves p down, left or diagonally down left towards p2.
 * @param  {Object} p
 * @param  {Object} p2
 *
 * @returns {null}
 */
function moveDownLeft(p, p2) {
  const unitVector = unitVectorFromPtoP2(p, p2);

  // Largest dot product is fastest way to travel.
  const dotProducts = [
    dotProduct2D(unitVector, DIRECTIONS.down),
    dotProduct2D(unitVector, DIRECTIONS.left),
    dotProduct2D(unitVector, DIRECTIONS.downLeft),
  ];

  const largestIndex = getIndexOfLargestInLengthThreeArray(dotProducts);

  switch (largestIndex) {
    case 0:
      p.y--;
      break;
    case 1:
      p.x--;
      break;
    case 2:
      p.y--;
      p.x--;
  }
}

/**
 * UnitVectorFromPtoP2 - Returns a unit vector pointing from p to p2.
 * @param  {Object} p
 * @param  {Object} p2
 *
 * @returns {Object} The unit vector.
 */
function unitVectorFromPtoP2(p, p2) {
  const distance = external.cornerstoneMath.point.distance(p, p2);

  return {
    x: (p2.x - p.x) / distance,
    y: (p2.y - p.y) / distance,
  };
}

function dotProduct2D(p, p2) {
  return p.x * p2.x + p.y * p2.y;
}

/**
 * GetIndexOfLargestInLengthThreeArray - Returns the index of the largest value
 * in the 3 element array.
 * @param  {number[]} array
 * @returns {number}
 */
function getIndexOfLargestInLengthThreeArray(array) {
  let largestIndex = array[0] > array[1] ? 0 : 1;

  if (array[2] > array[largestIndex]) {
    largestIndex = 2;
  }

  return largestIndex;
}
