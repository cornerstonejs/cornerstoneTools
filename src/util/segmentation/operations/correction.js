import { fillInside } from '.';

import { getLogger } from '../../logger';

const logger = getLogger('util:segmentation:opperations:correction');

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

  // For each point, determine whether or not it is inside a segment
  points.forEach(point => {
    const { x, y } = point;

    const xRound = Math.floor(x);
    const yRound = Math.floor(y);

    point.segment = segmentationData[yRound * cols + xRound];
  });

  logger.warn(points);

  //const startAndEndEqual =
  //  points[0].segment === points[points.length - 1].segment;
  //const startOutside = points[0].segment === outsideLabelValue;

  let allInside = true;
  let allOutside = true;

  for (let i = 0; i < points.length; i++) {
    const point = points[i];

    if (point.segment === labelValue) {
      allOutside = false;
    } else {
      allInside = false;
    }

    if (!allInside && !allOutside) {
      break;
    }
  }

  //const firstInsidePoint = points.find(p => p.segment === labelValue);

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

  /*
  if (startOutside && startAndEndEqual ) {
    // If the user draws a line which starts and ends outside the segmenation a part of it is cut off (left image)
    // TODO: this behaviour currently isn't correct. It should erase the entire portion of the segment, not just what is inside the polygon defined by the points
    // Not sure what the fastest way to do this is yet.

    // TODO -> Don't use zero. I think the fill mechanism in general needs to be rewritten to support multiple segments.
    fillInside(points, segmentationData, evt, 0);

    return;
  } else if (!startOutside && startAndEndEqual && allSegmentsEqualOrOutside) {
    // If the line is drawn fully inside the segmentation the marked region is added to the segmentation (right image)
    fillInside(points, segmentationData, evt, labelValue);

    return;
  }
  */
}
