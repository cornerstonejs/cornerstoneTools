import { fillInside, eraseInside } from './index.js';
import getPixelPathBetweenPixels from './getPixelPathBetweenPixels';
import clip from '../../clip';
import pointInImage from '../../pointInImage';

import { getLogger } from '../../logger';
import floodFill from './floodFill.js';

const logger = getLogger('util:segmentation:operations:correction');

/**
 * correction - Using the stroke given, determine which action(s) to perfom:
 * - Stroke starts and ends inside a segmentation: Behaves as an subtractive freehand scissors.
 * - Stroke starts and ends outside a segmentation: Behaves as an additive freehand scissors.
 * - Stroke out-in-out: Section is subtracted.
 * - Stroke in-out-in: Section is added.
 *
 * @param  {Object} evt The cornerstone event.
 * @returns {null}
 */
export default function correction(evt) {
  const { operationData } = evt;

  if (operationData.segmentationMixinType !== `freehandSegmentationMixin`) {
    logger.error(
      `correction operation requires freehandSegmentationMixin operationData, recieved ${
        operationData.segmentationMixinType
      }`
    );

    return;
  }

  const { pixelData, segmentIndex } = operationData;

  const nodes = snapPointsToGrid(evt);

  if (simpleScissorOperation(nodes, evt, segmentIndex)) {
    return;
  }

  const operations = splitLineIntoSeperateOperations(nodes, segmentIndex);

  // Create binary labelmap with only this segment for calculations of each operation.
  const workingLabelMap = new Uint8Array(pixelData.length);

  operations.forEach(operation => {
    performOperation(operation, pixelData, workingLabelMap, segmentIndex, evt);
  });
}

/**
 * SnapPointsToGrid - Snap the freehand points to the labelmap grid and attach a label for each node.
 *
 * @param  {Object[]} points An array of points drawn by the user.
 * @param  {UInt16Array} pixelData The 2D labelmap.
 * @param  {Object} evt The cornerstone event.
 * @returns {Object[]}
 */
function snapPointsToGrid(evt) {
  const { operationData } = evt;
  const { pixelData, points } = operationData;

  const { image } = evt.detail;
  const cols = image.width;
  const rows = image.height;

  const nodes = [];

  for (let i = 0; i < points.length; i++) {
    const point = points[i];

    let x = Math.floor(point.x);
    let y = Math.floor(point.y);

    // Clamp within the confines of the image.
    x = clip(x, 0, cols - 1);
    y = clip(y, 0, rows - 1);

    const lastNode = nodes[nodes.length - 1];

    // Skip double counting of closely drawn freehand points.
    if (lastNode && x === lastNode.x && y === lastNode.y) {
      continue;
    }

    nodes.push({
      x,
      y,
      segment: pixelData[y * cols + x],
    });
  }

  return nodes;
}
/**
 * SimpleScissorOperation - Check if the operation is a simple scissors
 * add/remove, and performs it if so.
 * @param  {Object[]} nodes - The nodes snapped to the grid.
 * @param  {Object} points - An array of points drawn by the user.
 * @param  {UInt16Array} pixelData The 2D labelmap.
 * @param  {Object} evt The cornerstone event.
 * @param  {number} segmentIndex
 * @returns {boolean} Returns true if the operation was simple.
 */
function simpleScissorOperation(nodes, evt, segmentIndex) {
  let allInside = true;
  let allOutside = true;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (node.segment === segmentIndex) {
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
    fillInside(evt);

    return true;
  } else if (allInside) {
    logger.warn('The line is only ever inside the segment.');
    eraseInside(evt);

    return true;
  }

  return false;
}

/**
 * performOperation - Performs the given add/subtract operation using a modification of the Tobias Heimann Correction Algorithm:
 * The algorithm is described in full length in Tobias Heimann's diploma thesis (MBI Technical Report 145, p. 37 - 40).
 *
 * @param  {Object} operation The operation.
 * @param  {UInt16Array} pixelData The 2D labelmap.
 * @param  {UInt16Array} workingLabelMap A copy of the labelmap for processing purposes.
 * @param  {number} segmentIndex The label of the tool being used.
 * @param  {Object} evt The cornerstone event.
 */
function performOperation(
  operation,
  pixelData,
  workingLabelMap,
  segmentIndex,
  evt
) {
  const eventData = evt.detail;
  const { image } = eventData;
  const cols = image.width;
  const rows = image.height;

  const { nodes, additive } = operation;
  const fillOver = additive ? 0 : 1;

  // Local getters to swap from cornerstone vector notation and flattened array indicies.
  const getPixelIndex = pixelCoord => pixelCoord.y * cols + pixelCoord.x;
  const getPixelCoordinateFromPixelIndex = pixelIndex => ({
    x: pixelIndex % cols,
    y: Math.floor(pixelIndex / cols),
  });

  if (additive) {
    logger.warn('additive operation...');
  } else {
    logger.warn('subtractive operation...');
  }

  const { pixelPath, leftPath, rightPath } = getPixelPaths(nodes);

  // Find extent of region for floodfill (This segment + the drawn loop).
  // This is to reduce the extent of the outwards floodfill, which constitutes 99% of the computation.
  const firstPixelOnPath = pixelPath[0];

  const boundingBox = {
    xMin: firstPixelOnPath.x,
    xMax: firstPixelOnPath.x,
    yMin: firstPixelOnPath.y,
    yMax: firstPixelOnPath.y,
  };

  // ...whilst also initializing the workingLabelmap
  for (let i = 0; i < workingLabelMap.length; i++) {
    if (pixelData[i] === segmentIndex) {
      const pixel = getPixelCoordinateFromPixelIndex(i);

      expandBoundingBox(boundingBox, pixel);
      workingLabelMap[i] = 1;
    } else {
      workingLabelMap[i] = 0;
    }
  }

  // Set workingLabelmap pixelPath to 2 to form a boundary.
  for (let i = 0; i < pixelPath.length; i++) {
    const pixel = pixelPath[i];

    workingLabelMap[getPixelIndex(pixel)] = 2;
    expandBoundingBox(boundingBox, pixel);
  }

  clipBoundingBox(boundingBox, rows, cols);

  const { xMin, xMax, yMin, yMax } = boundingBox;

  // Define a getter for the fill routine to access the working label map.
  function getter(x, y) {
    // Check if out of bounds, as the flood filler doesn't know about the dimensions of
    // The data structure. E.g. if cols is 10, (0,1) and (10, 0) would point to the same
    // position in this getter.

    if (x >= xMax || x < xMin || y >= yMax || y < yMin) {
      return;
    }

    return workingLabelMap[y * cols + x];
  }

  let leftArea = 0;
  let rightArea = 0;

  // Traverse the path whilst pouring paint off the left and right sides.
  for (let i = 0; i < leftPath.length; i++) {
    // Left fill
    const leftPixel = leftPath[i];
    const leftValue = workingLabelMap[getPixelIndex(leftPixel)];

    if (leftValue === fillOver && pointInImage(leftPixel, rows, cols)) {
      leftArea += fillFromPixel(leftPixel, 3, workingLabelMap, getter, cols);
    }

    // Right fill
    const rightPixel = rightPath[i];
    const rightValue = workingLabelMap[getPixelIndex(rightPixel)];

    if (rightValue === fillOver && pointInImage(rightPixel, rows, cols)) {
      rightArea += fillFromPixel(rightPixel, 4, workingLabelMap, getter, cols);
    }
  }

  if (leftArea === 0 || rightArea === 0) {
    // The areas are connected, therefore the start and end
    // Of the path go through unconnected regions, exit.
    return;
  }

  const replaceValue = additive ? segmentIndex : 0;

  // Fill in smallest area.
  const fillValue = leftArea < rightArea ? 3 : 4;

  for (let i = 0; i < workingLabelMap.length; i++) {
    if (workingLabelMap[i] === fillValue) {
      pixelData[i] = replaceValue;
    }
  }

  if (replaceValue === segmentIndex) {
    // Fill in the path.
    for (let i = 0; i < pixelPath.length; i++) {
      pixelData[getPixelIndex(pixelPath[i])] = segmentIndex;
    }
  } else {
    // Only erase this segment.
    for (let i = 0; i < pixelPath.length; i++) {
      const pixelIndex = getPixelIndex(pixelPath[i]);

      if (pixelData[pixelIndex] === segmentIndex) {
        pixelData[pixelIndex] = 0;
      }
    }
  }
}

/**
 * ExpandBoudningBox - expands the bounding box if the pixel falls outside it.
 *
 * @param  {Object} boundingBox The bounding box.
 * @param  {Object} pixel The pixel.
 * @returns {null}
 */
function expandBoundingBox(boundingBox, pixel) {
  const { x, y } = pixel;

  if (x < boundingBox.xMin) {
    boundingBox.xMin = x;
  }
  if (x > boundingBox.xMax) {
    boundingBox.xMax = x;
  }
  if (y < boundingBox.yMin) {
    boundingBox.yMin = y;
  }
  if (y > boundingBox.yMax) {
    boundingBox.yMax = y;
  }
}

/**
 * ClipBoundingBox - Expands the bounding box by 2 px and then clips it to the image size.
 * @param  {Object} boundingBox The bounding box.
 * @param  {number} rows The number of rows.
 * @param  {number} cols The number of columns.
 * @returns {null}
 */
function clipBoundingBox(boundingBox, rows, cols) {
  // Add a 2px border to stop the floodfill starting out of bounds and exploading.
  const border = 2;

  boundingBox.xMax = Math.min(boundingBox.xMax + border, cols);
  boundingBox.xMin = Math.max(boundingBox.xMin - border, 0);
  boundingBox.yMax = Math.min(boundingBox.yMax + border, rows);
  boundingBox.yMin = Math.max(boundingBox.yMin - border, 0);
}

/**
 * FillFromPixel - Performs a floodfill from the given pixel to the workingLabelMap.
 * @param  {Object} pixel The pixel.
 * @param  {number} fillValue The fill value.
 * @param  {UInt8Array} workingLabelMap The working labelmap.
 * @param  {function} getter The getter function for pixels in the labelmap.
 * @param  {number} cols The number of columns.
 * @returns {number} The number of pixels flooded.
 */
function fillFromPixel(pixel, fillValue, workingLabelMap, getter, cols) {
  const result = floodFill(getter, [pixel.x, pixel.y]);

  const flooded = result.flooded;

  for (let p = 0; p < flooded.length; p++) {
    const floodedI = flooded[p];

    workingLabelMap[floodedI[1] * cols + floodedI[0]] = fillValue;
  }

  return flooded.length;
}

/**
 * GetPixelPaths - Interpolates the pixelPath using an obstacleless path finding algorithm.
 * @param  {Object[]} nodes The nodes to interpolate between.
 * @returns {Object} The pixelPath, and the path to the left and right of it.
 */
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
 * @param  {Object} pathPixel The pixel being queried.
 * @param  {Object} nextPathPixel the pathPixel's successor.
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

  logger.error(
    `Unable to find left and right paths for flood fill `,
    pathPixel,
    nextPathPixel,
    direction
  );
}

/**
 * SplitLineIntoSeperateOperations - Splits the path of nodes into
 * seperate add/remove operations.
 *
 * @param  {Object[]} nodes The array of nodes.
 * @param  {number} segmentIndex The label value to replace.
 * @returns {Object[]} An array of operations to perform.
 */
function splitLineIntoSeperateOperations(nodes, segmentIndex) {
  // Check whether the first node is inside a segment of the appropriate label or not.
  let isLabel = nodes[0].segment === segmentIndex;

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

      if (node.segment !== segmentIndex) {
        // Start a new operation and include the last two nodes.

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

      if (node.segment === segmentIndex) {
        // Start a new operation and add include the last two nodes.
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
