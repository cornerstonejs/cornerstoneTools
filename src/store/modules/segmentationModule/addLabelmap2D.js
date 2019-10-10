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
  const sliceLength = rows * columns;
  const byteOffset = sliceLength * 2 * imageIdIndex; // 2 bytes/pixel

  const pixelData = new Uint16Array(
    brushStackState.labelmaps3D[labelmapIndex].buffer,
    byteOffset,
    sliceLength
  );

  brushStackState.labelmaps3D[labelmapIndex].labelmaps2D[imageIdIndex] = {
    pixelData,
    segmentsOnLabelmap: [],
  };
}
