import external from '../externalModules.js';
import { getToolState } from '../stateManagement/toolState.js';
import loadHandlerManager from '../stateManagement/loadHandlerManager.js';
import convertToVector3 from '../util/convertToVector3.js';

// In the future we will want to have a way to manually register links sets of the same orientation (e.g. an axial link set from a prior with an axial link set of a current).  The user could do this by scrolling the two stacks to a similar location and then doing a user action (e.g. right click link) at which point the system will capture the delta between the image position (patient) of both stacks and use that to sync them.  This offset will need to be adjustable.

/**
 * Calculate a position in space that is offset from the source image's position,
 * and synchronize the target stack to the image that is closest to that position.
 * @export
 * @public
 * @method
 * @name stackImagePositionOffsetSynchronizer
 *
 * @param {Object} synchronizer - The Synchronizer instance that attaches this
 * handler to an event
 * @param {HTMLElement} sourceElement - The source element
 * @param {HTMLElement} targetElement - The target element
 * @param {Object} eventData - The data object from the triggering event
 * @param {Object} positionDifference - An object with { x, y, z } values that will be
 * added to the source image's coordinates
 * @returns {void}
 */
export default function(
  synchronizer,
  sourceElement,
  targetElement,
  eventData,
  positionDifference
) {
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
    return;
  }

  const sourceImagePosition = convertToVector3(
    sourceImagePlane.imagePositionPatient
  );

  const stackToolDataSource = getToolState(targetElement, 'stack');
  const stackData = stackToolDataSource.data[0];

  let minDistance = Number.MAX_VALUE;
  let newImageIdIndex = -1;

  if (!positionDifference) {
    return;
  }

  const finalPosition = sourceImagePosition.clone().add(positionDifference);

  stackData.imageIds.forEach(function(imageId, index) {
    const imagePlane = cornerstone.metaData.get('imagePlaneModule', imageId);

    if (
      imagePlane === undefined ||
      imagePlane.imagePositionPatient === undefined
    ) {
      return;
    }

    const imagePosition = convertToVector3(imagePlane.imagePositionPatient);
    const distance = finalPosition.distanceToSquared(imagePosition);

    if (distance < minDistance) {
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
