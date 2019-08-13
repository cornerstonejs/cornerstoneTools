import { fillInside } from '.';
import getPixelPathBetweenPixels from './getPixelPathBetweenPixels';
import clip from '../../clip';

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
  const rows = image.height;

  const nodes = [];

  // For each point, snap to a pixel and determine whether or not it is inside a segment.
  for (let i = 0; i < points.length; i++) {
    const point = points[i];

    let x = Math.floor(point.x);
    let y = Math.floor(point.y);

    // Clamp within the confines of the image.
    x = clip(x, 0, cols - 1);
    y = clip(y, 0, rows - 1);

    const lastNode = nodes[nodes.length - 1];

    // Skip the node if it falls in the same pixel as the previous point.
    if (lastNode && x === lastNode.x && y === lastNode.y) {
      continue;
    }

    nodes.push({
      x,
      y,
      segment: segmentationData[y * cols + x],
    });
  }

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

  // TODO ->
  // //DONE 1) copy labelmap only once for all calculations (this segment only).
  // 2) For each operation:
  //   a) Perform calculation and find pixels to change.
  //   b) Change pixels on source labelmap. (fill some region with labelValue or zero)
  //   c) Change pixels on copy for next calculation.
  //

  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i];

    performOperation(
      operation,
      segmentationData,
      workingLabelMap,
      labelValue,
      evt
    );
  }
}

function performOperation(
  operation,
  segmentationData,
  workingLabelMap,
  labelValue,
  evt
) {
  const { nodes, additive } = operation;

  if (additive) {
    logger.warn('additive operation...');
  } else {
    logger.warn('subtractive operation...');
  }

  for (let i = 0; i < workingLabelMap.length; i++) {
    workingLabelMap[i] = segmentationData[i] === labelValue ? 1 : 0;
  }

  const fillOver = additive ? 0 : 1;

  const eventData = evt.detail;
  const { image } = eventData;
  const cols = image.width;
  const rows = image.height;

  const getPixelIndex = pixelCoord => pixelCoord.y * cols + pixelCoord.x;

  // Tobias Heimann Correction Algorithm:
  // The algorithm is described in full length in Tobias Heimann's diploma thesis
  // (MBI Technical Report 145, p. 37 - 40).

  const { pixelPath, leftPath, rightPath } = getPixelPaths(nodes);

  // Set workingLabelmap pixelPath to 2 to form a boundary.
  for (let i = 0; i < pixelPath.length; i++) {
    const pixel = pixelPath[i];

    workingLabelMap[getPixelIndex(pixel)] = 2;
  }

  // Define a getter for the fill routine to access the working label map.
  function getter(x, y) {
    // Check if out of bounds, as the flood filler doesn't know about the dimensions of
    // The datastructure. E.g. if cols is 10, (0,1) and (10, 0) would point to the same
    // position in this getter.
    if (x >= cols || x < 0 || y > rows || y < 0) {
      return;
    }

    return workingLabelMap[y * cols + x];
  }

  let leftArea = 0;
  let rightArea = 0;

  // Traverse the path and flood fill the left and right sides.
  for (let i = 0; i < leftPath.length; i++) {
    // Left fill
    const leftPathPixel = leftPath[i];
    const leftPathValue = workingLabelMap[getPixelIndex(leftPathPixel)];

    if (leftPathValue === fillOver) {
      leftArea += fillFromPixel(
        leftPathPixel,
        3,
        workingLabelMap,
        getter,
        cols
      );
    }

    const rightPathPixel = rightPath[i];
    const rightPathValue = workingLabelMap[getPixelIndex(rightPathPixel)];

    if (rightPathValue === fillOver) {
      rightArea += fillFromPixel(
        rightPathPixel,
        4,
        workingLabelMap,
        getter,
        cols
      );
    }
  }

  if (leftArea === 0 || rightArea === 0) {
    // The areas are connected, therefore the start and end
    // Of the path go through unconnected regions, exit.
    return;
  }

  // Fill in smallest area.
  const fillValue = leftArea < rightArea ? 3 : 4;
  const replaceValue = additive ? labelValue : 0;

  for (let i = 0; i < workingLabelMap.length; i++) {
    if (workingLabelMap[i] === fillValue) {
      segmentationData[i] = replaceValue;
    }
  }

  // Fill in the path
  for (let i = 0; i < pixelPath.length; i++) {
    segmentationData[getPixelIndex(pixelPath[i])] = replaceValue;
  }
}

function fillFromPixel(pixel, fillValue, workingLabelMap, getter, cols) {
  const result = floodFill({
    getter: getter,
    seed: [pixel.x, pixel.y],
  });

  const flooded = result.flooded;

  for (let p = 0; p < flooded.length; p++) {
    const floodedI = flooded[p];

    workingLabelMap[floodedI[1] * cols + floodedI[0]] = fillValue;
  }

  return flooded.length;
}

function getPixelPaths(nodes) {
  const pixelPath = [];

  for (let i = 0; i < nodes.length - 1; i++) {
    // Push the node.
    pixelPath.push(nodes[i]);
    // Path towards next node.
    pixelPath.push(...getPixelPathBetweenPixels(nodes[i], nodes[i + 1]));
  }

  // Push final node.
  pixelPath.push[nodes[nodes.length - 1]];

  // Get paths on either side.

  const leftPath = [];
  const rightPath = [];

  for (let i = 0; i < pixelPath.length - 1; i++) {
    const { left, right } = getNodesPerpendicularToPathPixel(
      pixelPath[i],
      pixelPath[i + 1]
    );

    leftPath.push(left);
    rightPath.push(right);
  }

  return { pixelPath, leftPath, rightPath };
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
        // Start a new operation and add this node and the previous node.

        operationIndex++;
        isLabel = !isLabel;
        operations.push({
          additive: true,
          nodes: [],
        });
        operations[operationIndex].nodes.push(nodes[i - 1]);
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
        operations[operationIndex].nodes.push(nodes[i - 1]);
        operations[operationIndex].nodes.push(node);
      }
    }
  }

  // Trim the first and last entries, as they don't form full operations.

  operations.pop();
  operations.shift();

  return operations;
}
