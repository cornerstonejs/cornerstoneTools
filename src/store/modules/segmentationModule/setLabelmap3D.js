import getElement from './getElement';
import { getToolState } from '../../../stateManagement/toolState.js';
import state from './state';
import getSegmentsOnPixelData from './getSegmentsOnPixeldata';
import { triggerLabelmapModifiedEvent } from '../../../util/segmentation';
import ARRAY_TYPES from './arrayTypes';
import { getModule } from '../../index.js';

const { UINT_16_ARRAY, FLOAT_32_ARRAY } = ARRAY_TYPES;

/**
 * Takes a 16-bit encoded `ArrayBuffer` and stores it as a `Labelmap3D` for the
 * `BrushStackState` associated with the element.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID The cornerstone
 *                                                  enabled element or its UUID.
 * @param  {ArrayBuffer} buffer
 * @param  {number} labelmapIndex The index to store the labelmap under.
 * @param  {Object[]} metadata = [] Any metadata about the segments.
 * @param  {number[][]} [segmentsOnLabelmapArray] An array of array of segments on each imageIdIndex.
 *                       If not present, is calculated.
 * @param  {colorLUTIndex} [colorLUTIndex = 0] The index of the colorLUT to use to render the segmentation.
 * @returns {null}
 */
function setLabelmap3DForElement(
  elementOrEnabledElementUID,
  buffer,
  labelmapIndex,
  metadata = [],
  segmentsOnLabelmapArray,
  colorLUTIndex = 0
) {
  const element = getElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  const stackState = getToolState(element, 'stack');
  const numberOfFrames = stackState.data[0].imageIds.length;
  const firstImageId = stackState.data[0].imageIds[0];

  setLabelmap3DByFirstImageId(
    firstImageId,
    buffer,
    labelmapIndex,
    metadata,
    numberOfFrames,
    segmentsOnLabelmapArray,
    colorLUTIndex
  );

  triggerLabelmapModifiedEvent(element, labelmapIndex);
}

/**
 * Takes an 16-bit encoded `ArrayBuffer` and stores it as a `Labelmap3D` for
 * the `BrushStackState` associated with the firstImageId.
 *
 * @param  {HTMLElement|string} firstImageId  The firstImageId of the series to
 *                                            store the segmentation on.
 * @param  {ArrayBuffer} buffer
 * @param  {number} labelmapIndex The index to store the labelmap under.
 * @param  {Object[]} metadata = [] Any metadata about the segments.
 * @param  {number} numberOfFrames The number of frames, required to set up the
 *                                 relevant labelmap2D views.
 * @param  {number[][]} [segmentsOnLabelmapArray] An array of array of segments on each imageIdIndex.
 *                       If not present, is calculated.
 * @param  {colorLUTIndex} [colorLUTIndex = 0] The index of the colorLUT to use to render the segmentation.
 * @returns {null}
 */
function setLabelmap3DByFirstImageId(
  firstImageId,
  buffer,
  labelmapIndex,
  metadata = [],
  numberOfFrames,
  segmentsOnLabelmapArray,
  colorLUTIndex = 0
) {
  const { configuration } = getModule('segmentation');

  let brushStackState = state.series[firstImageId];

  if (!brushStackState) {
    state.series[firstImageId] = {
      activeLabelmapIndex: labelmapIndex,
      labelmaps3D: [],
    };

    brushStackState = state.series[firstImageId];
  }

  brushStackState.labelmaps3D[labelmapIndex] = {
    buffer,
    labelmaps2D: [],
    metadata,
    activeSegmentIndex: 1,
    colorLUTIndex,
    segmentsHidden: [],
    undo: [],
    redo: [],
  };

  const labelmaps2D = brushStackState.labelmaps3D[labelmapIndex].labelmaps2D;
  const slicelengthInBytes = buffer.byteLength / numberOfFrames;

  for (let i = 0; i < numberOfFrames; i++) {
    let pixelData;

    switch (configuration.arrayType) {
      case UINT_16_ARRAY:
        pixelData = new Uint16Array(
          buffer,
          slicelengthInBytes * i, // 2 bytes/voxel
          slicelengthInBytes / 2
        );

        break;

      case FLOAT_32_ARRAY:
        pixelData = new Float32Array(
          buffer,
          slicelengthInBytes * i,
          slicelengthInBytes / 4
        );
        break;

      default:
        throw new Error(`Unsupported Array Type ${configuration.arrayType}`);
    }

    const segmentsOnLabelmap = segmentsOnLabelmapArray
      ? segmentsOnLabelmapArray[i]
      : getSegmentsOnPixelData(pixelData);

    if (segmentsOnLabelmap && segmentsOnLabelmap.some(segment => segment)) {
      labelmaps2D[i] = {
        pixelData,
        segmentsOnLabelmap,
      };
    }
  }
}

export { setLabelmap3DByFirstImageId, setLabelmap3DForElement };
