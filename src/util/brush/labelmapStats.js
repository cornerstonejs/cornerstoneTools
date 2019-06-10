/**
 * labelmapStats - Returns the statistics of the requested labelmap.
 *
 * @param  {type} labelmapBuffer The buffer for the labelmap.
 * @param  {Number[][]} imagePixelData The pixeldata of each image slice.
 * @param  {Number} sliceLength    The number of pixels in one slice.
 * @param  {Number} segmentIndex   The index of the segment.
 * @returns {Promise} A promise that resolves to the stats.
 */
export default function labelmapStats(
  labelmapBuffer,
  imagePixelData,
  sliceLength,
  segmentIndex
) {
  const segmentPixelValues = [];

  for (let img = 0; img < imagePixelData.length; img++) {
    const Uint8SliceView = new Uint8Array(
      labelmapBuffer,
      img * sliceLength,
      sliceLength
    );
    const image = imagePixelData[img];

    for (let ind = 0; ind < image.length; ind++) {
      if (Uint8SliceView[ind] === segmentIndex) {
        segmentPixelValues.push(image[ind]);
      }
    }
  }
  const maximum = Math.max(...segmentPixelValues);
  let mean = 0;

  for (let i = 0; i < segmentPixelValues.length; i++) {
    mean += segmentPixelValues[i];
  }

  mean /= segmentPixelValues.length;

  let stdDev = 0;

  for (let i = 0; i < segmentPixelValues.length; i++) {
    stdDev += Math.pow(segmentPixelValues[i] - mean, 2);
  }

  stdDev = Math.pow(stdDev, 0.5);

  return {
    maximum,
    mean,
    stdDev,
  };
}
