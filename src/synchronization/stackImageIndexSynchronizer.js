import external from '../externalModules.js';
import { getToolState } from '../stateManagement/toolState.js';
import loadHandlerManager from '../stateManagement/loadHandlerManager.js';
import clip from '../util/clip.js';

/**
 * Synchronize the target stack to the index closest to the source stack's index
 * @export
 * @public
 * @method
 * @name stackImageIndexSynchronizer
 *
 * @param {Object} synchronizer - The Synchronizer instance that attaches this
 * handler to an event
 * @param {HTMLElement} sourceElement - The source element for the index value
 * @param {HTMLElement} targetElement - The target element
 * @returns {void}
 */
export default function(synchronizer, sourceElement, targetElement) {
  // Ignore the case where the source and target are the same enabled element
  if (targetElement === sourceElement) {
    return;
  }

  const cornerstone = external.cornerstone;
  const sourceStackToolDataSource = getToolState(sourceElement, 'stack');
  const sourceStackData = sourceStackToolDataSource.data[0];
  const targetStackToolDataSource = getToolState(targetElement, 'stack');
  const targetStackData = targetStackToolDataSource.data[0];

  let newImageIdIndex = sourceStackData.currentImageIdIndex;

  // Clamp the index
  newImageIdIndex = clip(
    newImageIdIndex,
    0,
    targetStackData.imageIds.length - 1
  );

  // Do nothing if the index has not changed
  if (newImageIdIndex === targetStackData.currentImageIdIndex) {
    return;
  }

  const startLoadingHandler = loadHandlerManager.getStartLoadHandler(
    targetElement
  );
  const endLoadingHandler = loadHandlerManager.getEndLoadHandler(targetElement);
  const errorLoadingHandler = loadHandlerManager.getErrorLoadingHandler(
    targetElement
  );

  if (startLoadingHandler) {
    startLoadingHandler(targetElement);
  }

  let loader;

  if (targetStackData.preventCache === true) {
    loader = cornerstone.loadImage(targetStackData.imageIds[newImageIdIndex]);
  } else {
    loader = cornerstone.loadAndCacheImage(
      targetStackData.imageIds[newImageIdIndex]
    );
  }

  loader.then(
    function(image) {
      const viewport = cornerstone.getViewport(targetElement);

      targetStackData.currentImageIdIndex = newImageIdIndex;
      synchronizer.displayImage(targetElement, image, viewport);
      if (endLoadingHandler) {
        endLoadingHandler(targetElement, image);
      }
    },
    function(error) {
      const imageId = targetStackData.imageIds[newImageIdIndex];

      if (errorLoadingHandler) {
        errorLoadingHandler(targetElement, imageId, error);
      }
    }
  );
}
