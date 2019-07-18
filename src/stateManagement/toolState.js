import EVENTS from '../events.js';
import external from '../externalModules.js';
import { globalImageIdSpecificToolStateManager } from './imageIdSpecificStateManager.js';
import triggerEvent from '../util/triggerEvent.js';

/**
 * Returns the toolstate for a specific element.
 * @public
 * @function getElementToolStateManager
 *
 * @param  {HTMLElement} element The element.
 * @returns {Object} The toolState.
 */
function getElementToolStateManager(element) {
  const enabledElement = external.cornerstone.getEnabledElement(element);
  // If the enabledElement has no toolStateManager, create a default one for it
  // NOTE: This makes state management element specific

  if (enabledElement.toolStateManager === undefined) {
    enabledElement.toolStateManager = globalImageIdSpecificToolStateManager;
  }

  return enabledElement.toolStateManager;
}

/**
 * Adds tool state to the toolStateManager, this is done by tools as well
 * as modules that restore saved state.
 * @public
 * @method addToolState
 *
 * @param  {HTMLElement} element  The element.
 * @param  {string} toolType      The toolType of the state.
 * @param  {Object} measurementData The data to store in the state.
 * @returns {undefined}
 */
function addToolState(element, toolType, measurementData) {
  const toolStateManager = getElementToolStateManager(element);

  toolStateManager.add(element, toolType, measurementData);

  const eventType = EVENTS.MEASUREMENT_ADDED;
  const eventData = {
    toolType,
    element,
    measurementData,
  };

  triggerEvent(element, eventType, eventData);
}

/**
 * Returns tool specific state of an element. Used by tools as well as modules
 * that save state persistently
 * @export
 * @public
 * @method
 * @name getToolState
 *
 * @param  {HTMLElement} element The element.
 * @param  {string} toolType The toolType of the state.
 * @returns {Object}          The element's state for the given toolType.
 */
function getToolState(element, toolType) {
  const toolStateManager = getElementToolStateManager(element);

  return toolStateManager.get(element, toolType);
}

/**
 * Removes specific tool state from the toolStateManager.
 * @public
 * @method removeToolState
 *
 * @param  {HTMLElement} element  The element.
 * @param  {string} toolType      The toolType of the state.
 * @param  {Object} data          The data to remove from the toolStateManager.
 * @returns {undefined}
 */
function removeToolState(element, toolType, data) {
  const toolStateManager = getElementToolStateManager(element);
  const toolData = toolStateManager.get(element, toolType);
  // Find this tool data
  let indexOfData = -1;

  for (let i = 0; i < toolData.data.length; i++) {
    if (toolData.data[i] === data) {
      indexOfData = i;
    }
  }

  if (indexOfData !== -1) {
    toolData.data.splice(indexOfData, 1);

    const eventType = EVENTS.MEASUREMENT_REMOVED;
    const eventData = {
      toolType,
      element,
      measurementData: data,
    };

    triggerEvent(element, eventType, eventData);
  }
}

/**
 * Removes all toolState from the toolStateManager corresponding to
 * the toolType and element.
 * @public
 * @method clearToolState
 *
 * @param  {HTMLElement} element  The element.
 * @param  {string} toolType      The toolType of the state.
 * @returns {undefined}
 */
function clearToolState(element, toolType) {
  const toolStateManager = getElementToolStateManager(element);
  const toolData = toolStateManager.get(element, toolType);

  // If any toolData actually exists, clear it
  if (toolData !== undefined) {
    toolData.data = [];
  }
}

/**
 * Sets the tool state manager for an element
 * @public
 * @method setElementToolStateManager
 *
 * @param  {HTMLElement} element The element.
 * @param {Object} toolStateManager The toolStateManager.
 * @returns {undefined}
 */
function setElementToolStateManager(element, toolStateManager) {
  const enabledElement = external.cornerstone.getEnabledElement(element);

  enabledElement.toolStateManager = toolStateManager;
}

export {
  addToolState,
  getToolState,
  removeToolState,
  clearToolState,
  setElementToolStateManager,
  getElementToolStateManager,
};
