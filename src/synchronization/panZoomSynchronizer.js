import external from '../externalModules.js';

/**
 * Synchronize the target zoom and pan to match the source
 * @export
 * @public
 * @method
 * @name panZoomSynchronizer
 *
 * @param {Object} synchronizer - The Synchronizer instance that attaches this
 * handler to an event
 * @param {HTMLElement} sourceElement - The source element for the zoom and pan values
 * @param {HTMLElement} targetElement - The target element
 * @returns {void}
 */
export default function(synchronizer, sourceElement, targetElement) {
  // Ignore the case where the source and target are the same enabled element
  if (targetElement === sourceElement) {
    return;
  }

  const cornerstone = external.cornerstone;
  // Get the source and target viewports
  const sourceViewport = cornerstone.getViewport(sourceElement);
  const targetViewport = cornerstone.getViewport(targetElement);

  // Do nothing if the scale and translation are the same
  if (
    targetViewport.scale === sourceViewport.scale &&
    targetViewport.translation.x === sourceViewport.translation.x &&
    targetViewport.translation.y === sourceViewport.translation.y
  ) {
    return;
  }

  // Scale and/or translation are different, sync them
  targetViewport.scale = sourceViewport.scale;
  targetViewport.translation.x = sourceViewport.translation.x;
  targetViewport.translation.y = sourceViewport.translation.y;
  synchronizer.setViewport(targetElement, targetViewport);
}
