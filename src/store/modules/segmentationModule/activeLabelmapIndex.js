import getElement from './getElement';
import { getToolState } from '../../../stateManagement/toolState.js';
import addLabelmap3D from './addLabelmap3D';
import state from './state';
import external from '../../../externalModules';

/**
 * Returns the index of the active `Labelmap3D`.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID The cornerstone
 *                                            enabled element or its UUID.
 * @returns {number} The index of the active `Labelmap3D`.
 */
function getActiveLabelmapIndex(elementOrEnabledElementUID) {
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

  return brushStackState.activeLabelmapIndex;
}

/**
 * Sets the active `labelmapIndex` for the `BrushStackState` displayed on this
 * element. Creates the corresponding `Labelmap3D` if it doesn't exist.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {number} labelmapIndex = 0 The index of the labelmap.
 * @returns {null}
 */
function setActiveLabelmapIndex(elementOrEnabledElementUID, labelmapIndex = 0) {
  const element = getElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const cornerstone = external.cornerstone;
  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const enabledElement = cornerstone.getEnabledElement(element);
  const { rows, columns } = enabledElement.image;
  const numberOfFrames = stackData.imageIds.length;
  const size = rows * columns * numberOfFrames;
  const firstImageId = stackData.imageIds[0];

  let brushStackState = state.series[firstImageId];

  if (brushStackState) {
    brushStackState.activeLabelmapIndex = labelmapIndex;

    if (!brushStackState.labelmaps3D[labelmapIndex]) {
      addLabelmap3D(brushStackState, labelmapIndex, size);
    }
  } else {
    state.series[firstImageId] = {
      activeLabelmapIndex: labelmapIndex,
      labelmaps3D: [],
    };

    brushStackState = state.series[firstImageId];

    addLabelmap3D(brushStackState, labelmapIndex, size);
  }

  cornerstone.updateImage(element);
}

export { getActiveLabelmapIndex, setActiveLabelmapIndex };
