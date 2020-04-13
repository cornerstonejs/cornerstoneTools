import ARRAY_TYPES from './arrayTypes';
import { getModule } from '../../index.js';

const { UINT_16_ARRAY, FLOAT_32_ARRAY } = ARRAY_TYPES;

/**
 * AddLabelmap3D - Adds a `Labelmap3D` object to the `BrushStackState` object.
 *
 * @param  {BrushStackState} brushStackState The labelmap state for a particular stack.
 * @param  {number} labelmapIndex   The labelmapIndex to set.
 * @param  {number} size            The size of the ArrayBuffer in bytes/ 2.
 * @returns {null}
 */
export default function addLabelmap3D(brushStackState, labelmapIndex, size) {
  const { configuration } = getModule('segmentation');
  let bytesPerVoxel;

  switch (configuration.arrayType) {
    case UINT_16_ARRAY:
      bytesPerVoxel = 2;

      break;

    case FLOAT_32_ARRAY:
      bytesPerVoxel = 4;
      break;

    default:
      throw new Error(`Unsupported Array Type ${configuration.arrayType}`);
  }

  // Buffer size is multiplied by bytesPerVoxel to allocate enough space.
  brushStackState.labelmaps3D[labelmapIndex] = {
    buffer: new ArrayBuffer(size * bytesPerVoxel),
    labelmaps2D: [],
    metadata: [],
    activeSegmentIndex: 1,
    colorLUTIndex: 0,
    segmentsHidden: [],
    undo: [],
    redo: [],
  };
}
