import external from '../externalModules.js';

/**
 * Redraw target image immediately any time handler is called from source element.
 * @export
 * @public
 * @method
 * @name updateImageSynchronizer
 *
 * @param {Object} synchronizer - The Synchronizer instance that attaches this
 * handler to an event
 * @param {HTMLElement} sourceElement - The source element
 * @param {HTMLElement} targetElement - The target element
 * @returns {void}
 */
export default function(synchronizer, sourceElement, targetElement) {
  // Ignore the case where the source and target are the same enabled element
  if (targetElement === sourceElement) {
    return;
  }

  external.cornerstone.updateImage(targetElement);
}
