import external from '../externalModules.js';
import { getToolState } from '../stateManagement/toolState.js';
import loadHandlerManager from '../stateManagement/loadHandlerManager.js';
import convertToVector3 from '../util/convertToVector3.js';

// This function causes the image in the target stack to be set to the one closest
// To the image in the source stack by image position
export default function (synchronizer, sourceElement, targetElement) {

  // Ignore the case where the source and target are the same enabled element
  if (targetElement === sourceElement) {
    return;
  }

  const cornerstone = external.cornerstone;
  const sourceStackData = getToolState(sourceElement, 'stack').data[0];
  const sourceImageId = sourceStackData.imageIds[sourceStackData.currentImageIdIndex];
  const sourceImagePlane = cornerstone.metaData.get('imagePlaneModule', sourceImageId);

  if (sourceImagePlane === undefined || sourceImagePlane.imagePositionPatient === undefined) {
    // Console.log('No position found for image ' + sourceImage.imageId);

    return;
  }

  const sourceImagePosition = convertToVector3(sourceImagePlane.imagePositionPatient);
  const stackToolDataSource = getToolState(targetElement, 'stack');
  const stackData = stackToolDataSource.data[0];

  let minDistance = Number.MAX_VALUE;
  let newImageIdIndex = -1;

  stackData.imageIds.forEach((imageId, index) => {
    const imagePlane = cornerstone.metaData.get('imagePlaneModule', imageId);

    if (imagePlane === undefined || imagePlane.imagePositionPatient === undefined) {
      // Console.log('No position found for image ' + imageId);

      return;
    }

    const imagePosition = convertToVector3(imagePlane.imagePositionPatient);
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

    loader.then(function (image) {
      const viewport = cornerstone.getViewport(targetElement);

      if (stackData.currentImageIdIndex !== newImageIdIndex) {
        return;
      }

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
