import getElement from './getElement';
import { getToolState } from '../../../stateManagement/toolState.js';
import state from './state';
import { getModule } from '../../index.js';

/**
 * Returns the `activeSegmentIndex` for the active `Labelmap3D` for the `BrushStackState` displayed on the element.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {number} [labelmapIndex] The labelmap index, defaults to the active labelmap index.
 * @returns {number}                                  The active segment index.
 */
function getActiveSegmentIndex(elementOrEnabledElementUID, labelmapIndex) {
  const element = getElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  if (brushStackState) {
    labelmapIndex =
      labelmapIndex === undefined
        ? brushStackState.activeLabelmapIndex
        : labelmapIndex;

    const labelmap3D = brushStackState.labelmaps3D[labelmapIndex];

    if (labelmap3D) {
      return labelmap3D.activeSegmentIndex;
    }
  }

  return 1;
}

/**
 * Sets the `activeSegmentIndex` for the active `Labelmap3D` on the element.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param {number}  segmentIndex The segmentIndex to set active.
 * @returns {null}
 */
function setActiveSegmentIndex(elementOrEnabledElementUID, segmentIndex) {
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

  const activeLabelmapIndex = brushStackState.activeLabelmapIndex;
  const labelmap3D = brushStackState.labelmaps3D[activeLabelmapIndex];

  const { configuration } = getModule('segmentation');

  if (segmentIndex <= 0) {
    segmentIndex = 1;
  } else if (segmentIndex > configuration.segmentsPerLabelmap) {
    segmentIndex = configuration.segmentsPerLabelmap;
  }

  labelmap3D.activeSegmentIndex = segmentIndex;
}

/**
 * Increment the `activeSegmentIndex` for the active `Labelmap3D` on the element.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @returns {null}
 */
function incrementActiveSegmentIndex(elementOrEnabledElementUID) {
  const element = getElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  _changeActiveSegmentIndex(element, 'increase');
}

/**
 * Decrement the `activeSegmentIndex` for the active `Labelmap3D` on the element.
 *
 * @param  {HTMLElement} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @returns {null}
 */
function decrementActiveSegmentIndex(elementOrEnabledElementUID) {
  const element = getElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  _changeActiveSegmentIndex(element, 'decrease');
}

/**
 * Changes the `activeSegmentIndex` for the active `Labelmap3D` on the element.
 *
 * @param  {HTMLElement} element  The cornerstone enabled element.
 * @param  {string} increaseOrDecrease = Whether to increase/decrease the activeLabelmapIndex.
 * @returns {null}
 */
function _changeActiveSegmentIndex(element, increaseOrDecrease = 'increase') {
  const { configuration } = getModule('segmentation');
  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  const brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    return;
  }

  const activeLabelmapIndex = brushStackState.activeLabelmapIndex;
  const labelmap3D = brushStackState.labelmaps3D[activeLabelmapIndex];

  switch (increaseOrDecrease) {
    case 'increase':
      labelmap3D.activeSegmentIndex++;

      if (labelmap3D.activeSegmentIndex > configuration.segmentsPerLabelmap) {
        labelmap3D.activeSegmentIndex = 1;
      }
      break;
    case 'decrease':
      labelmap3D.activeSegmentIndex--;

      if (labelmap3D.activeSegmentIndex <= 0) {
        labelmap3D.activeSegmentIndex = configuration.segmentsPerLabelmap;
      }
      break;
  }
}

export {
  getActiveSegmentIndex,
  setActiveSegmentIndex,
  incrementActiveSegmentIndex,
  decrementActiveSegmentIndex,
};
