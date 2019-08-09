import { fillInside } from '.';

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

  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i];

    if (operation.additive) {
      addOperation(operation.nodes, segmentationData);
    } else {
      // TODO -> additive mode
      logger.warn('implement subtractive mode!');
    }
  }
}

function addOperation(nodes, segmentationData) {
  logger.warn('additive operation...');
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
