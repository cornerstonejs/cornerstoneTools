/**
 * Returns true if the pixelIndex of pixelData is the same as the segmentIndex.
 *
 * @param  {number} pixelIndex The index of the pixel.
 * @param  {UInt16Array} pixelData The pixelData array.
 * @param  {number} segmentIndex The segment Index to erase.
 *
 * @returns {boolean}
 */
export default function isSameSegment(pixelIndex, pixelData, segmentIndex) {
  return pixelData[pixelIndex] === segmentIndex;
}
