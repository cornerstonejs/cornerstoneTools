import ARRAY_TYPES from './arrayTypes';
import { getModule } from '../../index.js';

const { UINT_16_ARRAY, FLOAT_32_ARRAY } = ARRAY_TYPES;

/**
 * Adds a `Labelmap2D` view of one frame of a `Labelmap3D`.
 *
 * @param  {BrushStackState} brushStackState     The `BrushStackState` for a particular `Series`.
 * @param  {number} labelmapIndex       The labelmap index.
 * @param  {number} imageIdIndex        The stack position of the image.
 * @param  {number} rows                The number of rows in the image.
 * @param  {number} columns             The number of columns in the image.
 * @returns {null}
 */
export default function addLabelmap2D(
  brushStackState,
  labelmapIndex,
  imageIdIndex,
  rows,
  columns
) {
  const { configuration } = getModule('segmentation');
  const sliceLength = rows * columns;

  const elementOffset = sliceLength * imageIdIndex;

  let pixelData;

  switch (configuration.arrayType) {
    case UINT_16_ARRAY:
      pixelData = new Uint16Array(
        brushStackState.labelmaps3D[labelmapIndex].buffer,
        elementOffset * 2, // 2 bytes/voxel
        sliceLength
      );

      break;

    case FLOAT_32_ARRAY:
      pixelData = new Float32Array(
        brushStackState.labelmaps3D[labelmapIndex].buffer,
        elementOffset * 4, // 4 bytes/voxel
        sliceLength
      );
      break;

    default:
      throw new Error(`Unsupported Array Type ${configuration.arrayType}`);
  }

  brushStackState.labelmaps3D[labelmapIndex].labelmaps2D[imageIdIndex] = {
    pixelData,
    segmentsOnLabelmap: [],
  };
}
