/**
 * Returns an array of the segment indicies present on the `pixelData`.
 * @param  {UInt16Array|Float32Array} pixelData The pixel data array.
 */
export default function getSegmentsOnPixelData(pixelData) {
  return [...new Set(pixelData)];
}
