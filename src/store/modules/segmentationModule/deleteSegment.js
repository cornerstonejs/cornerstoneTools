import getElement from './getElement';
import { getToolState } from '../../../stateManagement/toolState.js';
import state from './state';
import external from '../../../externalModules';

/**
 * Deletes the segment and any associated metadata from the `Labelmap3D`.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID The cornerstone enabled element or its UUID.
 * @param  {number} segmentIndex     The segment Index
 * @param  {number} [labelmapIndex]  The labelmap index. Defaults to the active labelmap index.
 *
 * @returns {null}
 */
export default function deleteSegment(
  elementOrEnabledElementUID,
  segmentIndex,
  labelmapIndex
) {
  if (!segmentIndex) {
    return;
  }

  const element = getElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    return;
  }

  labelmapIndex =
    labelmapIndex === undefined
      ? brushStackState.activeLabelmapIndex
      : labelmapIndex;

  const labelmap3D = brushStackState.labelmaps3D[labelmapIndex];

  if (!labelmap3D) {
    return;
  }

  // Delete metadata if present.
  delete labelmap3D.metadata[segmentIndex];

  const labelmaps2D = labelmap3D.labelmaps2D;

  // Clear segment's voxels.
  for (let i = 0; i < labelmaps2D.length; i++) {
    const labelmap2D = labelmaps2D[i];

    // If the labelmap2D has data, and it contains the segment, delete it.
    if (labelmap2D && labelmap2D.segmentsOnLabelmap.includes(segmentIndex)) {
      const pixelData = labelmap2D.pixelData;

      // Remove this segment from the list.
      const indexOfSegment = labelmap2D.segmentsOnLabelmap.indexOf(
        segmentIndex
      );

      labelmap2D.segmentsOnLabelmap.splice(indexOfSegment, 1);

      // Delete the label for this segment.
      for (let p = 0; p < pixelData.length; p++) {
        if (pixelData[p] === segmentIndex) {
          pixelData[p] = 0;
        }
      }
    }
  }

  external.cornerstone.updateImage(element);
}
