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
  const sourceImage = cornerstone.getEnabledElement(sourceElement).image;
  const sourceImagePlane = cornerstone.metaData.get('imagePlaneModule', sourceImage.imageId);
  let sourceImagePosition;

  if (sourceImagePlane !== undefined) {
    sourceImagePosition = convertToVector3(sourceImagePlane.imagePositionPatient);
  }

  if (sourceImagePosition === undefined) {
    // Console.log('No position found for image ' + sourceImage.imageId);

    return;
  }

  const stackToolDataSource = getToolState(targetElement, 'stack');
  const stackData = stackToolDataSource.data[0];

  let minDistance = Number.MAX_VALUE;
  let newImageIdIndex = -1;
  let nbComparedPositions = 0;

  stackData.imageIds.forEach((imageId, index) => {
    const imagePlane = cornerstone.metaData.get('imagePlaneModule', imageId);
    let imagePosition;

    if (imagePlane !== undefined) {
      imagePosition = convertToVector3(imagePlane.imagePositionPatient);
    }

    if (imagePosition === undefined) {
      // Console.log('No position found for image ' + imageId);

      return;
    }

    nbComparedPositions++;
    const distance = imagePosition.distanceToSquared(sourceImagePosition);
    // Console.log(index + '=' + distance);

    if (distance < minDistance) {
      minDistance = distance;
      newImageIdIndex = index;
    }
  });

  if (nbComparedPositions !== stackData.imageIds.length) {
    // Console.log('No position found for ' + (stackData.imageIds.length - nbComparedPositions) + ' images of ' + stackData.imageIds.length);
  }

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
