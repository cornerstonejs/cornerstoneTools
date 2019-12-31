import external from '../externalModules.js';
import { getToolState } from '../stateManagement/toolState.js';
import loadHandlerManager from '../stateManagement/loadHandlerManager.js';
import convertToVector3 from '../util/convertToVector3.js';

/**
 * Synchronize the target stack to the image closest to the source image's position
 * @export
 * @public
 * @method
 * @name stackImagePositionSynchronizer
 *
 * @param {Object} synchronizer - The Synchronizer instance that attaches this
 * handler to an event
 * @param {HTMLElement} sourceElement - The source element for the image position
 * @param {HTMLElement} targetElement - The target element
 * @returns {void}
 */
export default function(synchronizer, sourceElement, targetElement) {
  // Ignore the case where the source and target are the same enabled element
  if (targetElement === sourceElement) {
    return;
  }

  const cornerstone = external.cornerstone;
  const sourceStackData = getToolState(sourceElement, 'stack').data[0];
  const sourceImageId =
    sourceStackData.imageIds[sourceStackData.currentImageIdIndex];
  const sourceImagePlane = cornerstone.metaData.get(
    'imagePlaneModule',
    sourceImageId
  );

  if (
    sourceImagePlane === undefined ||
    sourceImagePlane.imagePositionPatient === undefined
  ) {
    // Console.log('No position found for image ' + sourceImage.imageId);

    return;
  }

  const sourceImagePosition = convertToVector3(
    sourceImagePlane.imagePositionPatient
  );
  const sourceImageOrientationPatient = {
    row: convertToVector3(sourceImagePlane.rowCosines),
    col: convertToVector3(sourceImagePlane.columnCosines),
  };
  const stackToolDataSource = getToolState(targetElement, 'stack');
  const stackData = stackToolDataSource.data[0];

  let minDistance = Number.MAX_VALUE;
  let newImageIdIndex = -1;

  stackData.imageIds.forEach((imageId, index) => {
    const imagePlane = cornerstone.metaData.get('imagePlaneModule', imageId);

    if (
      imagePlane === undefined ||
      imagePlane.imagePositionPatient === undefined
    ) {
      // Console.log('No position found for image ' + imageId);

      return;
    }

    const imagePosition = convertToVector3(imagePlane.imagePositionPatient);
    const imageOrientationPatient = {
      row: convertToVector3(imagePlane.rowCosines),
      col: convertToVector3(imagePlane.columnCosines),
    };
    const distance = imagePosition.distanceToSquared(sourceImagePosition);
    // Console.log(index + '=' + distance);

    console.log('compare 2 image', index);
    console.table([sourceImagePosition, imagePosition, distance]);
    console.table([sourceImagePlane.sliceLocation, imagePlane.sliceLocation]);
    if (
      distance < minDistance &&
      comparePlane(
        sourceImageOrientationPatient.row,
        imageOrientationPatient.row
      ) &&
      comparePlane(
        sourceImageOrientationPatient.col,
        imageOrientationPatient.col
      )
    ) {
      minDistance = distance;
      newImageIdIndex = index;
    }
  });

  if (
    newImageIdIndex === stackData.currentImageIdIndex ||
    newImageIdIndex === -1
  ) {
    return;
  }

  const startLoadingHandler = loadHandlerManager.getStartLoadHandler(
    targetElement
  );
  const endLoadingHandler = loadHandlerManager.getEndLoadHandler(targetElement);
  const errorLoadingHandler = loadHandlerManager.getErrorLoadingHandler(
    targetElement
  );

  stackData.currentImageIdIndex = newImageIdIndex;
  const newImageId = stackData.imageIds[newImageIdIndex];

  if (startLoadingHandler) {
    startLoadingHandler(targetElement);
  }

  if (newImageIdIndex !== -1) {
    let loader;

    if (stackData.preventCache === true) {
      loader = cornerstone.loadImage(newImageId);
    } else {
      loader = cornerstone.loadAndCacheImage(newImageId);
    }

    loader.then(
      function(image) {
        const viewport = cornerstone.getViewport(targetElement);

        if (stackData.currentImageIdIndex !== newImageIdIndex) {
          return;
        }

        synchronizer.displayImage(targetElement, image, viewport);
        if (endLoadingHandler) {
          endLoadingHandler(targetElement, image);
        }
      },
      function(error) {
        const imageId = stackData.imageIds[newImageIdIndex];

        if (errorLoadingHandler) {
          errorLoadingHandler(targetElement, imageId, error);
        }
      }
    );
  }
}

const minValue = 0.1;
const comparePlane = (vector1, vector2) => {
  // console.log('compare 2 vector');
  // console.table([vector1, vector2]);
  const k0 = Math.abs(vector1.x - vector2.x);
  const k1 = Math.abs(vector1.y - vector2.y);
  const k2 = Math.abs(vector1.z - vector2.z);

  // console.table([k0, k1, k2]);

  return k0 <= minValue && k1 <= minValue && k2 <= minValue;
};
