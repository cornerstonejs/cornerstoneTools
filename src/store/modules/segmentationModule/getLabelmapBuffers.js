import getElement from './getElement';
import { getToolState } from '../../../stateManagement/toolState.js';
import getLabelmaps3D from './getLabelmaps3D';
import state from './state';

/**
 * GetLabelmapBuffers - Returns the `buffer` of each `Labelmap3D` associated
 *                      with the `BrushStackState` displayed on the element, or a specific
 *                      one if `labelmapIndex` is defined.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param {type} [labelmapIndex] Optional filtering to only return one labelmap.
 * @returns {Object|Object[]} An array of objects containing the `labelmapIndex` and
 *                        corresponding `buffer`. Only one object if `labelmapIndex` was specified.
 *
 */
function getLabelmapBuffers(elementOrEnabledElementUID, labelmapIndex) {
  const element = getElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const { labelmaps3D } = getLabelmaps3D(element);

  if (!labelmaps3D) {
    return [];
  }

  if (labelmapIndex !== undefined) {
    if (labelmaps3D[labelmapIndex]) {
      return {
        labelmapIndex,
        bytesPerVoxel: 2,
        buffer: labelmaps3D[labelmapIndex].buffer,
      };
    }

    return;
  }

  const labelmapBuffers = [];

  for (let i = 0; i < labelmaps3D.length; i++) {
    if (labelmaps3D[i]) {
      labelmapBuffers.push({
        labelmapIndex: i,
        bytesPerVoxel: 2,
        buffer: labelmaps3D[i].buffer,
      });
    }
  }

  return labelmapBuffers;
}

/**
 * Returns the `buffer` corresponding to the active `Labelmap3D` associated with the
 * `BrushStackState` displayed onv the element.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @returns {Object}      An object containing the `labelmapIndex` and
 *                        corresponding `buffer`.
 */
function getActiveLabelmapBuffer(elementOrEnabledElementUID) {
  const element = getElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const imageIds = stackState.data[0].imageIds;
  const firstImageId = imageIds[0];

  const brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    return;
  }

  const activeLabelmapIndex = brushStackState.activeLabelmapIndex;

  return getLabelmapBuffers(element, activeLabelmapIndex);
}

export { getLabelmapBuffers, getActiveLabelmapBuffer };
