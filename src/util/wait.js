import external from './../externalModules.js';

/**
 * Waits a set amount of time, then resolves. Can be chained off of to delay
 * next call in promise chain.
 * @public
 * @function wait
 * @param {number} ms - number in ms to wait
 * @returns {Promise} - A promise that resolves when setTimeout elapses
 */
export const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * A promise that returns an EnabledElement who's image has loaded, or
 * null if the provided element ceases being an enabledElement before an
 * image has been loaded.
 * @public
 * @function waitForEnabledElementImageToLoad
 *
 * @param {HTMLElement} element - An element that is an EnabledElement
 * @returns {EnabledElement} - The enabled element that has loaded an image
 */
export function waitForEnabledElementImageToLoad(element) {
  try {
    const enabledElement = external.cornerstone.getEnabledElement(element);

    if (!enabledElement.image) {
      return wait(250).then(() => waitForEnabledElementImageToLoad(element));
    }

    // EnabledElement's image is loaded.
    return enabledElement;
  } catch (ex) {
    // Is no longer, or never was an enabled element, stop polling
    return null;
  }
}

export default wait;
