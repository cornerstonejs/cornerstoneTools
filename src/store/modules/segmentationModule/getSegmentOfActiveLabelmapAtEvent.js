import { getToolState } from '../../../stateManagement/toolState.js';
import state from './state';
import isPointInImage from '../../../util/isPointInImage';

import { getLogger } from '../../../util/logger';

const logger = getLogger(
  'store:modules:segmentationModule:getSegmentOfActiveLabelmapAtEvent'
);

/**
 * Returns the segmentIndex at the event position and its corresponding metadata.
 * @param  {Object} evt A cornerstone event with a currentPoints property.
 *
 * @returns {Object} An `Object` with the `segmentIndex` and its `metadata`.
 */
export default function getSegmentOfActiveLabelmapAtEvent(evt) {
  const eventData = evt.detail;
  const { element, image, currentPoints } = eventData;

  if (!currentPoints) {
    logger.warn('Not a cornerstone input event.');

    return;
  }

  const cols = image.width;
  const rows = image.height;

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const currentImageIdIndex = stackData.currentImageIdIndex;
  const firstImageId = stackData.imageIds[0];
  const brushStackState = state.series[firstImageId];

  const activeLabelmapIndex = brushStackState.activeLabelmapIndex;

  const labelmap3D = brushStackState.labelmaps3D[activeLabelmapIndex];

  if (!labelmap3D) {
    // No labelmap3D === no segment here.
    return;
  }

  const labelmap2D = labelmap3D.labelmaps2D[currentImageIdIndex];

  if (!labelmap2D) {
    // No labelmap on this imageId === no segment here.
    return;
  }

  const pixelData = labelmap2D.pixelData;

  let { x, y } = currentPoints.image;

  x = Math.floor(x);
  y = Math.floor(y);

  if (isPointInImage({ x, y }, rows, cols)) {
    const segmentIndex = pixelData[y * cols + x];

    if (segmentIndex === 0) {
      return;
    }

    return {
      segmentIndex,
      metadata: labelmap3D.metadata[segmentIndex],
    };
  }

  // Outside image === no segment here.
  return;
}
