import { fillInside } from '.';

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
  image,
  labelValue = 1
) {
  const { width } = image;

  // For each point, determine whether or not it is inside a segment
  points.forEach(point => {
    const { x, y } = point;
    const xRound = Math.round(x);
    const yRound = Math.round(y);

    point.segment = segmentationData[yRound * width + xRound];
  });

  const outsideLabelValue = 0;
  const startAndEndEqual =
    points[0].segment === points[points.length - 1].segment;
  const startOutside = points[0].segment === outsideLabelValue;
  const firstInsidePoint = points.find(p => p.segment !== 0);

  if (!firstInsidePoint) {
    // eslint-disable-next-line
    console.log('The line never intersects a segment');
    // TODO: if the user draws a line which starts and ends outside the segmenation AND it intersects no other segmentation the endpoints of the line are connected and the resulting contour is filled
    // ... Do nothing (or draw a contour?)
    // In the docs it says it draws a contour, but in the latest application
    // it doesn't seem to do that

    return;
  }

  const firstInsideSegment = firstInsidePoint.segment;

  const allSegmentsEqualOrOutside = points.every(
    p => p.segment === firstInsideSegment || p.segment === 0
  );

  if (startOutside && startAndEndEqual && allSegmentsEqualOrOutside) {
    // If the user draws a line which starts and ends outside the segmenation a part of it is cut off (left image)
    // TODO: this behaviour currently isn't correct. It should erase the entire portion of the segment, not just what is inside the polygon defined by the points
    // Not sure what the fastest way to do this is yet.
    return fillInside(points, segmentationData, image, outsideLabelValue);
  } else if (!startOutside && startAndEndEqual && allSegmentsEqualOrOutside) {
    // If the line is drawn fully inside the segmentation the marked region is added to the segmentation (right image)
    return fillInside(points, segmentationData, image, labelValue);
  }
}
