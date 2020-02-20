import getElement from './getElement';
import { getToolState } from '../../../stateManagement/toolState.js';
import getSegmentsOnPixelData from './getSegmentsOnPixeldata';
import addLabelmap3D from './addLabelmap3D';
import addLabelmap2D from './addLabelmap2D';
import external from '../../../externalModules';
import state from './state';
import ARRAY_TYPES from './arrayTypes';
import { getModule } from '../../index.js';
import { getLogger } from '../../../util/logger';

const { UINT_16_ARRAY, FLOAT_32_ARRAY } = ARRAY_TYPES;

const logger = getLogger('store:modules:segmentationModule:getLabelmap2D');

/**
 * Returns the active `labelmap3D` and the `currentImageIdIndex`. If a labelmap does
 * not get exist, creates a new one. Generates a `labelmap2D` for the `currentImageIndex`
 * if it does not yet exist.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @returns {Object} The `Labelmap2D`, `Labelmap3D`, `activeLabelmapIndex` and `currentImageIdIndex`.
 */
export default function getLabelmap2D(elementOrEnabledElementUID) {
  const element = getElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const cornerstone = external.cornerstone;
  const stackState = getToolState(element, 'stack');

  if (!stackState) {
    logger.error(
      'Consumers must define stacks in their application if using segmentations in cornerstoneTools.'
    );

    return;
  }

  const stackData = stackState.data[0];

  const enabledElement = cornerstone.getEnabledElement(element);

  const currentImageIdIndex = stackData.currentImageIdIndex;
  const { rows, columns } = enabledElement.image;

  const numberOfFrames = stackData.imageIds.length;
  const firstImageId = stackData.imageIds[0];

  let brushStackState = state.series[firstImageId];

  let activeLabelmapIndex;

  if (brushStackState) {
    activeLabelmapIndex = brushStackState.activeLabelmapIndex;

    if (!brushStackState.labelmaps3D[activeLabelmapIndex]) {
      const size = rows * columns * numberOfFrames;

      addLabelmap3D(brushStackState, activeLabelmapIndex, size);
    }

    if (
      !brushStackState.labelmaps3D[activeLabelmapIndex].labelmaps2D[
        currentImageIdIndex
      ]
    ) {
      addLabelmap2D(
        brushStackState,
        activeLabelmapIndex,
        currentImageIdIndex,
        rows,
        columns
      );
    }
  } else {
    activeLabelmapIndex = 0;

    state.series[firstImageId] = {
      activeLabelmapIndex,
      labelmaps3D: [],
    };

    brushStackState = state.series[firstImageId];

    const size = rows * columns * numberOfFrames;

    addLabelmap3D(brushStackState, activeLabelmapIndex, size);

    addLabelmap2D(
      brushStackState,
      activeLabelmapIndex,
      currentImageIdIndex,
      rows,
      columns
    );
  }

  const labelmap3D = brushStackState.labelmaps3D[activeLabelmapIndex];

  return {
    labelmap2D: labelmap3D.labelmaps2D[currentImageIdIndex],
    labelmap3D,
    currentImageIdIndex,
    activeLabelmapIndex,
  };
}

/**
 * Returns a `Labelmap2D` view of a `Labelmap3D` for the given `imageIdIndex`.
 * Creates and caches it if it doesn't yet exist.
 *
 * @param  {Labelmap3D} labelmap3D   The `Labelmap3D` object.
 * @param  {number} imageIdIndex The imageId Index.
 * @param  {number} rows         The number of rows.
 * @param  {number} columns      The number of columns.
 * @returns {null}
 */
export function getLabelmap2DByImageIdIndex(
  labelmap3D,
  imageIdIndex,
  rows,
  columns
) {
  if (!labelmap3D.labelmaps2D[imageIdIndex]) {
    const { configuration } = getModule('segmentation');
    const sliceLength = rows * columns;

    const elementOffset = sliceLength * imageIdIndex;

    let pixelData;

    switch (configuration.arrayType) {
      case UINT_16_ARRAY:
        pixelData = new Uint16Array(
          labelmap3D.buffer,
          elementOffset * 2, // 2 bytes/voxel
          sliceLength
        );

        break;

      case FLOAT_32_ARRAY:
        pixelData = new Float32Array(
          labelmap3D.buffer,
          elementOffset * 4, // 4 bytes/voxel
          sliceLength
        );
        break;

      default:
        throw new Error(`Unsupported Array Type ${configuration.arrayType}`);
    }

    labelmap3D.labelmaps2D[imageIdIndex] = {
      pixelData,
      segmentsOnLabelmap: getSegmentsOnPixelData(pixelData),
    };
  }

  return labelmap3D.labelmaps2D[imageIdIndex];
}
