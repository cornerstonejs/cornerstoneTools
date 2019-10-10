/**
 * AddLabelmap3D - Adds a `Labelmap3D` object to the `BrushStackState` object.
 *
 * @param  {BrushStackState} brushStackState The labelmap state for a particular stack.
 * @param  {number} labelmapIndex   The labelmapIndex to set.
 * @param  {number} size            The size of the ArrayBuffer in bytes/ 2.
 * @returns {null}
 */
export default function addLabelmap3D(brushStackState, labelmapIndex, size) {
  // Buffer size is multiplied by 2 as we are using 2 bytes/voxel for 65536 segments.
  brushStackState.labelmaps3D[labelmapIndex] = {
    buffer: new ArrayBuffer(size * 2),
    labelmaps2D: [],
    metadata: [],
    activeSegmentIndex: 1,
    colorLUTIndex: 0,
    segmentsHidden: [],
    undo: [],
    redo: [],
  };
}
