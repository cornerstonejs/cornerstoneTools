import getElement from './getElement';
import { getToolState } from '../../../stateManagement/toolState.js';
import state from './state';
import external from '../../../externalModules';

import { getLogger } from '../../../util/logger';

const logger = getLogger('store:modules:segmentationModule:getLabelmapStats');

/**
 * Returns the maximum pixel value, mean and standard deviation of the segment
 * given by the `segmentIndex` and `labelmapIndex`.
 *
 * @param  {HTMLElement|string} elementOrEnabledElementUID   The cornerstone enabled
 *                                                    element or its UUID.
 * @param  {number} segmentIndex  The segment index to query.
 * @param  {number} labelmapIndex The `labelmapIndex` of the `Labelmap3D` to query.
 *                                Defaults to the activeLabelmapIndex if not given.
 * @returns {Promise|null} A promise that resolves to an object containing
 *                    the maximum pixel value, the mean and the standard deviation.
 *                    Returns null if no cornerstone element is found.
 */
export default function getLabelmapStats(
  elementOrEnabledElementUID,
  segmentIndex,
  labelmapIndex
) {
  const element = getElement(elementOrEnabledElementUID);

  if (!element) {
    return null;
  }

  const stackState = getToolState(element, 'stack');
  const imageIds = stackState.data[0].imageIds;
  const firstImageId = imageIds[0];

  return new Promise(resolve => {
    const brushStackState = state.series[firstImageId];

    if (!brushStackState) {
      resolve(null);
    }

    const imagePlanes = [];

    const cornerstone = external.cornerstone;
    const metadataProvider = cornerstone.metaData;

    let sufficientMetadata = true;

    for (let i = 0; i < imageIds.length; i++) {
      const imagePlaneModule = metadataProvider.get(
        'imagePlaneModule',
        imageIds[i]
      );

      if (!imagePlaneModule) {
        sufficientMetadata = false;
        break;
      }

      imagePlanes.push(imagePlaneModule);
    }

    if (!sufficientMetadata) {
      logger.warn(
        'Insufficient imagePlaneModule information to calculate volume statistics.'
      );
      resolve(null);
    }

    const imagePromises = [];

    for (let i = 0; i < imageIds.length; i++) {
      // TODO - Only get the relevant images for this segment.
      imagePromises.push(cornerstone.loadAndCacheImage(imageIds[i]));
    }

    labelmapIndex =
      labelmapIndex === undefined
        ? brushStackState.activeLabelmapIndex
        : labelmapIndex;

    const labelmap3D = brushStackState.labelmaps3D[labelmapIndex];

    Promise.all(imagePromises).then(images => {
      const stats = _calculateLabelmapStats(
        labelmap3D,
        images,
        imagePlanes,
        segmentIndex
      );

      resolve(stats);
    });
  });
}

/**
 *
 * @param {Labelmap3D} labelmap3D The labelmap3D object.
 * @param {Object[]} images An array of cornerstone images.
 * @param {Object[]} imagePlanes An array of the image planes for each image.
 * @param {number} segmentIndex
 */
function _calculateLabelmapStats(
  labelmap3D,
  images,
  imagePlanes,
  segmentIndex
) {
  const { rowPixelSpacing, columnPixelSpacing } = images[0];
  const labelmaps2D = labelmap3D.labelmaps2D;

  const voxelsPerFrame = [];

  for (let i = 0; i < labelmaps2D.length; i++) {
    const labelmap2D = labelmaps2D[i];

    if (labelmap2D && labelmap2D.segmentsOnLabelmap.includes(segmentIndex)) {
      const sliceThickness = getSliceThickness(images, imagePlanes, i);
      const voxelInMM3 = sliceThickness * rowPixelSpacing * columnPixelSpacing;
      const segmentationPixelData = labelmap2D.pixelData;
      const imagePixelData = images[i].getPixelData();
      const values = [];

      // Itterate over segmentationPixelData and count voxels.
      for (let p = 0; p < segmentationPixelData.length; p++) {
        if (segmentationPixelData[p] === segmentIndex) {
          values.push(imagePixelData[p]);
        }
      }

      voxelsPerFrame.push({
        voxelInMM3,
        values,
      });
    }
  }

  let volumeWeightedMean = 0;
  let max = voxelsPerFrame[0].values[0];
  let min = max;
  let volume = 0;

  for (let i = 0; i < voxelsPerFrame.length; i++) {
    const { values, voxelInMM3 } = voxelsPerFrame[i];

    volume += voxelInMM3 * values.length;

    let sum = 0;

    values.forEach(value => {
      if (value > max) {
        max = value;
      } else if (value < min) {
        min = value;
      }

      sum += value;
    });

    volumeWeightedMean += sum * voxelInMM3;
  }

  volumeWeightedMean /= volume;

  let volumeWeightedStDev = 0;

  // Calculate the volume weigthed standard deviation.
  for (let i = 0; i < voxelsPerFrame.length; i++) {
    const { values, voxelInMM3 } = voxelsPerFrame[i];

    let stdDevSum = 0;

    values.forEach(value => {
      stdDevSum += Math.pow(value - volumeWeightedMean, 2);
    });

    volumeWeightedStDev += stdDevSum * voxelInMM3;
  }

  volumeWeightedStDev /= volume;
  volumeWeightedStDev = Math.sqrt(volumeWeightedStDev);

  return {
    mean: volumeWeightedMean,
    max,
    min,
    stdDev: volumeWeightedStDev,
  };
}

function getSliceThickness(images, imagePlanes, imageIdIndex) {
  const numberOfSlices = images.length;

  console.log(imagePlanes);

  const ipp = imagePlanes[imageIdIndex].imagePositionPatient;

  // Special cases: Edge of volume - Assume thickness is the distance
  // between the current slice and the closest slice as this is all the information we have.
  if (imageIdIndex === 0) {
    const ippAbove = imagePlanes[imageIdIndex + 1].imagePositionPatient;

    return distanceBetweenSlices(ipp, ippAbove);
  } else if (imageIdIndex === numberOfSlices - 1) {
    const ippBelow = imagePlanes[imageIdIndex - 1].imagePositionPatient;

    return distanceBetweenSlices(ipp, ippBelow);
  }

  // Estimate slice thickness from two adjacent slices.
  const ippBelow = imagePlanes[imageIdIndex - 1].imagePositionPatient;
  const ippAbove = imagePlanes[imageIdIndex + 1].imagePositionPatient;

  return (
    (distanceBetweenSlices(ipp, ippBelow) +
      distanceBetweenSlices(ipp, ippAbove)) /
    2
  );
}

function distanceBetweenSlices(ipp1, ipp2) {
  return Math.sqrt(
    Math.pow(ipp1[0] - ipp2[0], 2) +
      Math.pow(ipp1[1] - ipp2[1], 2) +
      Math.pow(ipp1[2] - ipp2[2], 2)
  );
}
