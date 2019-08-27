import { getToolState } from '../../../stateManagement/toolState.js';
import getElement from './getElement';
import state from './state';

/**
 * Returns the `Labelmap3D` objects associated with the series displayed
 * in the element, the `activeLabelmapIndex` and the `currentImageIdIndex`.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @returns {Object}              An object containing `Labelmap3D` objects,
 *                                the `activeLabelmapIndex` amd the `currentImageIdIndex`.
 */
export default function getLabelmaps3D(elementOrEnabledElementUID) {
  const element = getElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];

  const firstImageId = stackData.imageIds[0];
  const brushStackState = state.series[firstImageId];

  let labelmaps3D;
  let activeLabelmapIndex;

  if (brushStackState) {
    labelmaps3D = brushStackState.labelmaps3D;
    activeLabelmapIndex = brushStackState.activeLabelmapIndex;
  }

  return {
    labelmaps3D,
    activeLabelmapIndex,
    currentImageIdIndex: stackData.currentImageIdIndex,
  };
}
