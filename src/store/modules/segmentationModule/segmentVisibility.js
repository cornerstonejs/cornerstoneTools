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

  if (labelmapIndex === undefined) {
    labelmapIndex = brushStackState.activeLabelmapIndex;
  }

  if (!brushStackState.labelmaps3D[labelmapIndex]) {
    logger.warn(`No labelmap3D of labelmap index ${labelmapIndex} on stack.`);

    return;
  }

  const labelmap3D = brushStackState.labelmaps3D[labelmapIndex];
  const visible = labelmap3D.segmentsVisible[segmentIndex];

  return visible || visible === undefined;
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

  if (labelmapIndex === undefined) {
    labelmapIndex = brushStackState.activeLabelmapIndex;
  }

  if (!brushStackState.labelmaps3D[labelmapIndex]) {
    logger.warn(`No labelmap3D of labelmap index ${labelmapIndex} on stack.`);

    return;
  }

  const labelmap3D = brushStackState.labelmaps3D[labelmapIndex];
  const segmentsVisible = labelmap3D.segmentsVisible;

  const visible = segmentsVisible[segmentIndex];

  if (visible || visible === undefined) {
    segmentsVisible[segmentIndex] = false;
  } else {
    segmentsVisible[segmentIndex] = true;
  }

  return segmentsVisible[segmentIndex];
}

export { isSegmentVisible, toggleSegmentVisibility };