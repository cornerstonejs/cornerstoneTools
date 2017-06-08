import * as cornerstone from 'cornerstone-core';
import { getToolState } from '../stateManagement/toolState';
import loadHandlerManager from '../stateManagement/loadHandlerManager';

// This function causes the image in the target stack to be set to the one closest
// To the image in the source stack by image position
export default function (synchronizer, sourceElement, targetElement) {

    // Ignore the case where the source and target are the same enabled element
  if (targetElement === sourceElement) {
    return;
  }

  const sourceImage = cornerstone.getEnabledElement(sourceElement).image;
  const sourceImagePlane = cornerstone.metaData.get('imagePlane', sourceImage.imageId);
  const sourceImagePosition = sourceImagePlane.imagePositionPatient;

  const stackToolDataSource = getToolState(targetElement, 'stack');
  const stackData = stackToolDataSource.data[0];

  let minDistance = Number.MAX_VALUE;
  let newImageIdIndex = -1;

  $.each(stackData.imageIds, function (index, imageId) {
    const imagePlane = cornerstone.metaData.get('imagePlane', imageId);
    const imagePosition = imagePlane.imagePositionPatient;
    const distance = imagePosition.distanceToSquared(sourceImagePosition);
        // Console.log(index + '=' + distance);

    if (distance < minDistance) {
      minDistance = distance;
      newImageIdIndex = index;
    }
  });

  if (newImageIdIndex === stackData.currentImageIdIndex) {
    return;
  }

  const startLoadingHandler = loadHandlerManager.getStartLoadHandler();
  const endLoadingHandler = loadHandlerManager.getEndLoadHandler();
  const errorLoadingHandler = loadHandlerManager.getErrorLoadingHandler();

  if (startLoadingHandler) {
    startLoadingHandler(targetElement);
  }

  if (newImageIdIndex !== -1) {
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
}
