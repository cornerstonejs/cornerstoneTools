import { fillInside } from '.';
import getPixelPathBetweenPixels from './getPixelPathBetweenPixels';

import { getLogger } from '../../logger';
import floodFill from './floodFill.js';

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

  // Create binary labelmap with only this segment for calculations of each operation.
  const workingLabelMap = new Uint8Array(segmentationData.length);

  for (let i = 0; i < workingLabelMap.length; i++) {
    if (segmentationData[i] === labelValue) {
      workingLabelMap[i] = 1;
    }
  }

  // TODO ->
  // //DONE 1) copy labelmap only once for all calculations (this segment only).
  // 2) For each operation:
  //   a) Perform calculation and find pixels to change.
  //   b) Change pixels on source labelmap. (fill some region with labelValue or zero)
  //   c) Change pixels on copy for next calculation.
  //

  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i];

    if (operation.additive) {
      addOperation(
        operation.nodes,
        segmentationData,
        workingLabelMap,
        labelValue,
        evt
      );
    } else {
      // TODO -> subtractive mode (this can likely be one function with different flags).
      logger.warn('implement subtractive mode!');
    }
  }
}

function addOperation(
  nodes,
  segmentationData,
  workingLabelMap,
  labelValue,
  evt
) {
  logger.warn('additive operation...');

  const cols = evt.detail.image.width;

  const getPixelIndex = pixelCoord => pixelCoord.y * cols + pixelCoord.x;
  const getPixelCoordinateFromPixelIndex = pixelIndex => ({
    x: pixelIndex % cols,
    y: Math.floor(pixelIndex / cols),
  });

  const pixelPath = [];

  for (let i = 0; i < nodes.length - 1; i++) {
    // Push the node.
    pixelPath.push(nodes[i]);
    // Path towards next node.
    pixelPath.push(...getPixelPathBetweenPixels(nodes[i], nodes[i + 1]));
  }

  // Push final node.
  pixelPath.push[nodes[nodes.length - 1]];

  // Tobias Heimann Correction Algorithm:
  // The algorithm is described in full length in Tobias Heimann's diploma thesis
  // (MBI Technical Report 145, p. 37 - 40).

  // Set path to 2.
  for (let i = 0; i < pixelPath.length; i++) {
    const pixel = pixelPath[i];

    workingLabelMap[getPixelIndex(pixel)] = 2;
  }

  // Traverse the left side of the path and flood fill 0s.

  const leftPath = [];
  const rightPath = [];

  logger.warn(pixelPath);

  for (let i = 0; i < pixelPath.length - 1; i++) {
    logger.warn(i);
    const { left, right } = getNodesPerpendicularToPathPixel(
      pixelPath[i],
      pixelPath[i + 1]
    );

    logger.warn(left, right);

    leftPath.push(left);
    rightPath.push(right);
  }

  logger.warn('left + right:');

  logger.warn(leftPath);
  logger.warn(rightPath);
}

/**
 * GetNodesPerpendicularToPathPixel - Using the current and next pixel on the path, determine the adjacent pixels
 * which are perpendicular to the path direction. (i.e. to the left and to the right).
 *
 * @param  {Object} pathPixel
 * @param  {Object} nextPathPixel
 *
 * @returns {Object} The coordinates of the left and right perpendicular pixels.
 */
function getNodesPerpendicularToPathPixel(pathPixel, nextPathPixel) {
  const direction = {
    x: nextPathPixel.x - pathPixel.x,
    y: nextPathPixel.y - pathPixel.y,
  };

  // P = pathPixel, n = nextPathPixel, L = left, R = right
  //
  // |n| |R|  | |n| |  |L| |n|
  // | |p| |  |L|p|R|  | |p| |
  // |L| | |  | | | |  | | |R|
  //
  // | |R| |           | |L| |
  // |n|p| |           | |p|n|
  // | |L| |           | |R| |
  //
  // |R| | |  | | | |  | | |L|
  // | |p| |  |R|p|L|  | |p| |
  // |n| |L|  | |n| |  |R| |n|

  if (direction.x === -1 && direction.y === 1) {
    return {
      left: { x: pathPixel.x - 1, y: pathPixel.y - 1 },
      right: { x: pathPixel.x + 1, y: pathPixel.y + 1 },
    };
  } else if (direction.x === 0 && direction.y === 1) {
    return {
      left: { x: pathPixel.x - 1, y: pathPixel.y },
      right: { x: pathPixel.x + 1, y: pathPixel.y },
    };
  } else if (direction.x === 1 && direction.y === 1) {
    return {
      left: { x: pathPixel.x - 1, y: pathPixel.y + 1 },
      right: { x: pathPixel.x + 1, y: pathPixel.y - 1 },
    };
  } else if (direction.x === 1 && direction.y === 0) {
    return {
      left: { x: pathPixel.x, y: pathPixel.y + 1 },
      right: { x: pathPixel.x, y: pathPixel.y - 1 },
    };
  } else if (direction.x === 1 && direction.y === -1) {
    return {
      left: { x: pathPixel.x + 1, y: pathPixel.y + 1 },
      right: { x: pathPixel.x - 1, y: pathPixel.y - 1 },
    };
  } else if (direction.x === 0 && direction.y === -1) {
    return {
      left: { x: pathPixel.x + 1, y: pathPixel.y },
      right: { x: pathPixel.x - 1, y: pathPixel.y },
    };
  } else if (direction.x === -1 && direction.y === -1) {
    return {
      left: { x: pathPixel.x + 1, y: pathPixel.y - 1 },
      right: { x: pathPixel.x - 1, y: pathPixel.y + 1 },
    };
  } else if (direction.x === -1 && direction.y === 0) {
    return {
      left: { x: pathPixel.x, y: pathPixel.y - 1 },
      right: { x: pathPixel.x, y: pathPixel.y + 1 },
    };
  }

  logger.error(pathPixel, nextPathPixel, direction);
}

/**
 * SplitLineIntoSeperateoperations
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
