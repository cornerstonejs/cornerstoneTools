import external from '../externalModules.js';

/**
 * Synchronize the target viewport ww/wc to match the source element.
 * @export
 * @public
 * @method
 * @name wwwcSynchronizer
 *
 * @param {Object} synchronizer - The Synchronizer instance that attaches this
 * handler to an event
 * @param {HTMLElement} sourceElement - The source element for the ww/wc values
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

  // Do nothing if the ww/wc already match
  if (
    targetViewport.voi.windowWidth === sourceViewport.voi.windowWidth &&
    targetViewport.voi.windowCenter === sourceViewport.voi.windowCenter &&
    targetViewport.invert === sourceViewport.invert
  ) {
    return;
  }

  // Www/wc are different, sync them
  targetViewport.voi.windowWidth = sourceViewport.voi.windowWidth;
  targetViewport.voi.windowCenter = sourceViewport.voi.windowCenter;
  targetViewport.invert = sourceViewport.invert;
  synchronizer.setViewport(targetElement, targetViewport);
}
