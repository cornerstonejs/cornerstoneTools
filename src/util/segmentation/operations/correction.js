import { fillInside } from '.';
import external from '../../../externalModules.js';

import { getLogger } from '../../logger';

const logger = getLogger('util:segmentation:operations:correction');

/*
With the correction tool you draw a stroke and the tool does "something useful"
http://mitk.org/wiki/Interactive_segmentation
- Stroke starts and ends inside a segmentation -> something is added
- Stroke starts and ends outside a segmentation -> something is removed
- In and out several times -> above points are done for individual segments


You do not have to draw a closed contour to use the Correction tool and do not need to switch between the Add and Subtract tool to perform small corrective changes. The following figure shows the usage of this tool:

- if the user draws a line which starts and ends outside the segmentation AND it intersects no other segmentation the endpoints of the line are connected and the resulting contour is filled
- if the user draws a line which starts and ends outside the segmentation a part of it is cut off (left image)
- if the line is drawn fully inside the segmentation the marked region is added to the segmentation (right image)
- http://docs.mitk.org/2016.11/org_mitk_views_segmentation.html
 */

export default function correction(
  points,
  segmentationData,
  evt,
  labelValue = 1
) {
  const { image } = evt.detail;
  const cols = image.width;

  const nodes = [];

  // For each point, snap to a pixel and determine whether or not it is inside a segment.
  points.forEach(point => {
    const x = Math.floor(point.x);
    const y = Math.floor(point.y);

    nodes.push({
      x,
      y,
      segment: segmentationData[y * cols + x],
    });
  });

  logger.warn(nodes);

  let allInside = true;
  let allOutside = true;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (node.segment === labelValue) {
      allOutside = false;
    } else {
      allInside = false;
    }

    if (!allInside && !allOutside) {
      break;
    }
  }

  logger.warn(allOutside, allInside);

  if (allOutside) {
    logger.warn('The line never intersects a segment.');
    fillInside(points, segmentationData, evt, labelValue);

    return;
  }

  if (allInside) {
    logger.warn('The line is only ever inside the segment.');
    fillInside(points, segmentationData, evt, 0);

    return;
  }

  const operations = splitLineIntoSeperateoperations(nodes, labelValue);

  logger.warn(operations);

  const t0 = performance.now();

  // TEMP
  const path = getPixelPathBetweenPixels(
    {
      x: 0,
      y: 0,
    },
    {
      x: 40,
      y: 25,
    }
  );

  const t1 = performance.now();

  logger.warn(`time: ${t1 - t0}`);
  logger.warn(path);

  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i];

    if (operation.additive) {
      // TODO -> additive mode
      logger.warn('implement additive mode!');
    } else {
      // TODO -> additive mode
      logger.warn('implement subtractive mode!');
    }
  }
}

/**
 * splitLineIntoSeperateoperations
 * @param  {} nodes
 * @param  {} labelValue
 */
function splitLineIntoSeperateoperations(nodes, labelValue) {
  // Check whether the first node is inside a segment of the appropriate label or not.
  let isLabel = nodes[0].segment === labelValue;

  const operations = [];

  operations.push({
    additive: !isLabel,
    nodes: [],
  });

  let operationIndex = 0;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (isLabel) {
      operations[operationIndex].nodes.push(node);

      if (node.segment !== labelValue) {
        // Start a new operation and add this node.
        operationIndex++;
        isLabel = !isLabel;
        operations.push({
          additive: true,
          nodes: [],
        });
        operations[operationIndex].nodes.push(node);
      }
    } else {
      operations[operationIndex].nodes.push(node);

      if (node.segment === labelValue) {
        // Start a new operation and add this node.
        operationIndex++;
        isLabel = !isLabel;
        operations.push({
          additive: false,
          nodes: [],
        });
        operations[operationIndex].nodes.push(node);
      }
    }
  }

  // Trim the first and last entries, as they don't form full operations.

  operations.pop();
  operations.shift();

  return operations;
}

/**
 * getPixelPathBetweenPixels - Generates a 1-pixel wide path of pixels between two pixels.
 * This is essentially simplified A* pathfinding, as we know there are no "obstacles".
 *
 * @param  {} p1
 * @param  {} p2
 */
function getPixelPathBetweenPixels(p1, p2) {
  const p = {
    x: p1.x,
    y: p1.y,
  };

  const path = [];

  path.push({
    x: p.x,
    y: p.y,
  });

  // TEMP - make sure we step in the right direction.

  //let counter = 1;

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
    } else {
      if (p2.x > p.x) {
        // Can go down, right, or diagonally down-right towards goal.
        moveDownRight(p, p2);
      } else {
        // Can go down, left, or diagonally down-left towards goal.
        moveDownLeft(p, p2);
      }
    }

    path.push({
      x: p.x,
      y: p.y,
    });
  }

  return path;
}

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

function getIndexOfLargestInLengthThreeArray(array) {
  let largestIndex = array[0] > array[1] ? 0 : 1;

  if (array[2] > array[largestIndex]) {
    largestIndex = 2;
  }

  return largestIndex;
}
