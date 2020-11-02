import getElement from './getElement';
import { getToolState } from '../../../stateManagement/toolState.js';
import state from './state';

/**
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID The cornerstone
 *                                            enabled element or its UUID.
 * @returns {null}
 */

export default function deleteAllLabelmaps(elementOrEnabledElementUID) {
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

  brushStackState.labelmaps3D = [];
}
