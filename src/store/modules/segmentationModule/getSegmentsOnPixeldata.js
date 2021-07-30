/**
 * Returns an array of the segment indicies present on the `pixelData`.
 * @param  {UInt16Array|Float32Array} pixelData The pixel data array.
 */
export default function getSegmentsOnPixelData(pixelData) {
  const segmentSet = new Set(pixelData);
  const iterator = segmentSet.values();

  const segmentsOnLabelmap = [];
  let done = false;

  while (!done) {
    const next = iterator.next();

    done = next.done;

    if (!done) {
      segmentsOnLabelmap.push(next.value);
    }
  }

  return segmentsOnLabelmap;
}
