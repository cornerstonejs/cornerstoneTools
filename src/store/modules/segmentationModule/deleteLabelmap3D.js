import getElement from './getElement';
import { getToolState } from '../../../stateManagement/toolState.js';
import state from './state';

/**
 * Returns the index of the active `Labelmap3D`.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID The cornerstone
 *                                            enabled element or its UUID.
 * @param labelmapIndex  The labelmapIndex to delete.
 * @returns {null}
 */

export default function deleteLabelmap3D(
  elementOrEnabledElementUID,
  labelmapIndex
) {
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

  if (!brushStackState.labelmaps3D[labelmapIndex]) {
    return;
  }

  brushStackState.labelmaps3D.splice(labelmapIndex, 1);
}
