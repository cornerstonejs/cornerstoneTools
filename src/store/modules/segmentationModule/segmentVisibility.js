import getElement from './getElement';
import { getToolState } from '../../../stateManagement/toolState.js';
import state from './state';

import { getLogger } from '../../../util/logger';

const logger = getLogger('store:modules:segmentationModule:segmentVisibility');

/**
 * Returns if a segment is visible.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {number} segmentIndex     The segment index.
 * @param  {number} [labelmapIndex]    If undefined, defaults to the active
 *                                     labelmap index.
 * @returns {boolean} True if the segment is visible.
 */
function isSegmentVisible(
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
    logger.warn(`brushStackState is undefined`);

    return;
  }

  labelmapIndex =
    labelmapIndex === undefined
      ? brushStackState.activeLabelmapIndex
      : labelmapIndex;

  if (!brushStackState.labelmaps3D[labelmapIndex]) {
    logger.warn(`No labelmap3D of labelmap index ${labelmapIndex} on stack.`);

    return;
  }

  const labelmap3D = brushStackState.labelmaps3D[labelmapIndex];
  const visible = !labelmap3D.segmentsHidden[segmentIndex];

  return visible;
}

/**
 * Toggles the visability of a segment.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {number} segmentIndex     The segment index.
 * @param  {number} [labelmapIndex]    If undefined, defaults to the active
 *                                     labelmap index.
 * @returns {boolean} True if the segment is now visible.
 */
function toggleSegmentVisibility(
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
    logger.warn(`brushStackState is undefined`);

    return;
  }

  labelmapIndex =
    labelmapIndex === undefined
      ? brushStackState.activeLabelmapIndex
      : labelmapIndex;

  if (!brushStackState.labelmaps3D[labelmapIndex]) {
    logger.warn(`No labelmap3D of labelmap index ${labelmapIndex} on stack.`);

    return;
  }

  const labelmap3D = brushStackState.labelmaps3D[labelmapIndex];
  const segmentsHidden = labelmap3D.segmentsHidden;

  segmentsHidden[segmentIndex] = !segmentsHidden[segmentIndex];

  return !segmentsHidden[segmentIndex];
}

export { isSegmentVisible, toggleSegmentVisibility };
