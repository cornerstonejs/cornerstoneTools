import getElement from './getElement';
import addLabelmap3D from './addLabelmap3D';
import { getToolState } from '../../../stateManagement/toolState.js';
import external from '../../../externalModules';
import { getLogger } from '../../../util/logger';
import state from './state';

const logger = getLogger('store:modules:segmentationModule:metadata');

/**
 * GetMetadata - Returns the metadata object for a particular segment if
 * segmentIndex is specified, otherwise returns an array of all segment metadata
 * for the labelmap.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {number} [labelmapIndex]    If undefined, defaults to the active
 *                                     labelmap index.
 * @param  {number} [segmentIndex]     The segment index.
 * @returns {Object|Object[]}          A metadata object or an array of
 *                                     metadata objects.
 */
function getMetadata(elementOrEnabledElementUID, labelmapIndex, segmentIndex) {
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

  if (segmentIndex === undefined) {
    return labelmap3D.metadata;
  }

  return labelmap3D.metadata[segmentIndex];
}

/**
 * SetMetadata - Sets the metadata object for a particular segment of a
 * `Labelmap3D`.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {number} labelmapIndex = 0 The labelmap index.
 * @param  {number} segmentIndex      The segment index.
 * @param  {Object} metadata          The metadata object to set.
 * @returns {null}
 */
function setMetadata(
  elementOrEnabledElementUID,
  labelmapIndex = 0,
  segmentIndex,
  metadata
) {
  const element = getElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const cornerstone = external.cornerstone;
  const stackState = getToolState(element, 'stack');
  const stackData = stackState.data[0];
  const firstImageId = stackData.imageIds[0];

  let brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    state.series[firstImageId] = {
      labelmapIndex,
      labelmaps3D: [],
    };

    brushStackState = state.series[firstImageId];
  }

  if (!brushStackState.labelmaps3D[labelmapIndex]) {
    const enabledElement = cornerstone.getEnabledElement(element);

    const { rows, columns } = enabledElement.image;
    const numberOfFrames = stackData.imageIds.length;
    const size = rows * columns * numberOfFrames;

    addLabelmap3D(brushStackState, labelmapIndex, size);
  }

  const labelmap3D = brushStackState.labelmaps3D[labelmapIndex];

  labelmap3D.metadata[segmentIndex] = metadata;
}

export { getMetadata, setMetadata };
