import * as cornerstone from 'cornerstone-core';
import { getToolState } from '../stateManagement/toolState';
import loadHandlerManager from '../stateManagement/loadHandlerManager';

// This function causes the image in the target stack to be set to the one closest
// To the image in the source stack by image position

// In the future we will want to have a way to manually register links sets of the same orientation (e.g. an axial link set from a prior with an axial link set of a current).  The user could do this by scrolling the two stacks to a similar location and then doing a user action (e.g. right click link) at which point the system will capture the delta between the image position (patient) of both stacks and use that to sync them.  This offset will need to be adjustable.

export default function (synchronizer, sourceElement, targetElement, eventData, positionDifference) {

    // Ignore the case where the source and target are the same enabled element
  if (targetElement === sourceElement) {
    return;
  }

  const sourceEnabledElement = cornerstone.getEnabledElement(sourceElement);
  const sourceImagePlane = cornerstone.metaData.get('imagePlane', sourceEnabledElement.image.imageId);
  const sourceImagePosition = sourceImagePlane.imagePositionPatient;

  const stackToolDataSource = getToolState(targetElement, 'stack');
  const stackData = stackToolDataSource.data[0];

  let minDistance = Number.MAX_VALUE;
  let newImageIdIndex = -1;

  if (!positionDifference) {
    return;
  }

  const finalPosition = sourceImagePosition.clone().add(positionDifference);

  stackData.imageIds.forEach(function (imageId, index) {
    const imagePlane = cornerstone.metaData.get('imagePlane', imageId);
    const imagePosition = imagePlane.imagePositionPatient;
    const distance = finalPosition.distanceToSquared(imagePosition);

    if (distance < minDistance) {
      minDistance = distance;
      newImageIdIndex = index;
    }
  });

  if (newImageIdIndex === stackData.currentImageIdIndex || newImageIdIndex === -1) {
    return;
  }

  const startLoadingHandler = loadHandlerManager.getStartLoadHandler();
  const endLoadingHandler = loadHandlerManager.getEndLoadHandler();
  const errorLoadingHandler = loadHandlerManager.getErrorLoadingHandler();

  if (startLoadingHandler) {
    startLoadingHandler(targetElement);
  }

  let loader;

  if (stackData.preventCache === true) {
    loader = cornerstone.loadImage(stackData.imageIds[newImageIdIndex]);
  } else {
    loader = cornerstone.loadAndCacheImage(stackData.imageIds[newImageIdIndex]);
  }

  loader.then(function (image) {
    const viewport = cornerstone.getViewport(targetElement);

    stackData.currentImageIdIndex = newImageIdIndex;
    synchronizer.displayImage(targetElement, image, viewport);
    if (endLoadingHandler) {
      endLoadingHandler(targetElement, image);
    }
  }, function (error) {
    const imageId = stackData.imageIds[newImageIdIndex];

    if (errorLoadingHandler) {
      errorLoadingHandler(targetElement, imageId, error);
    }
  });
}
