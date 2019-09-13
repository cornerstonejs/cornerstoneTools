import { getters as storeGetters } from '../../index.js';

/**
 * Returns the cornerstone enabled element given either the element or its enabledElement UUID.
 *
 * @param  {string|HTMLElement} elementOrEnabledElementUID  The enabledElement
 *                                                          or its UUID.
 * @returns {HTMLElement}
 */
export default function _getElement(elementOrEnabledElementUID) {
  if (elementOrEnabledElementUID instanceof HTMLElement) {
    return elementOrEnabledElementUID;
  }

  return storeGetters.enabledElementByUID(elementOrEnabledElementUID);
}
