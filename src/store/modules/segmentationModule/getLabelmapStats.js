import getElement from './getElement';
import { getToolState } from '../../../stateManagement/toolState.js';
import state from './state';
import external from '../../../externalModules';
/**
 * Returns the maximum pixel value, mean and standard deviation of the segment
 * given by the `segmentIndex` of the scan on the element.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {number} segmentIndex  The segment index to query.
 * @returns {Promise} A promise that resolves to an object containing
 *                    the maximum pixel value, the mean and the standard deviation.
 */
export default function getLabelmapStats(
  elementOrEnabledElementUID,
  segmentIndex
) {
  const element = getElement(elementOrEnabledElementUID);

  if (!element) {
    return;
  }

  return new Promise(resolve => {
    const cornerstone = external.cornerstone;
    const stackState = getToolState(element, 'stack');
    const imageIds = stackState.data[0].imageIds;
    const firstImageId = imageIds[0];

    const brushStackState = state.series[firstImageId];

    if (!brushStackState) {
      resolve();
    }

    const activeLabelmapIndex = brushStackState.activeLabelmapIndex;
    const labelmap3D = brushStackState.labelmaps3D[activeLabelmapIndex];
    const labelmap3Dbuffer = labelmap3D.buffer;

    const imagePromises = [];

    for (let i = 0; i < imageIds.length; i++) {
      imagePromises.push(cornerstone.loadAndCacheImage(imageIds[i]));
    }

    Promise.all(imagePromises).then(images => {
      const imagePixelData = [];

      const { rows, columns } = images[0];

      for (let i = 0; i < images.length; i++) {
        imagePixelData.push(images[i].getPixelData());
      }

      const stats = _calculateLabelmapStats(
        labelmap3Dbuffer,
        imagePixelData,
        rows * columns,
        segmentIndex
      );

      resolve(stats);
    });
  });
}

/**
 * Returns the statistics of the requested labelmap.
 *
 * @param  {type} labelmapBuffer The buffer for the labelmap.
 * @param  {Number[][]} imagePixelData The pixeldata of each image slice.
 * @param  {Number} sliceLength    The number of pixels in one slice.
 * @param  {Number} segmentIndex   The index of the segment.
 * @returns {Promise} A promise that resolves to the stats.
 */
function _calculateLabelmapStats(
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
