import EVENTS from '../events.js';
import external from '../externalModules.js';
import { globalImageIdSpecificToolStateManager } from './imageIdSpecificStateManager.js';
import triggerEvent from '../util/triggerEvent.js';


/**
 * Returns the toolstate for a specific element.
 * @export @public @method
 * @name getElementToolStateManager
 *
 * @param  {HTMLElement} element The element.
 * @return {object} The toolState.
 */
function getElementToolStateManager (element) {
  const enabledElement = external.cornerstone.getEnabledElement(element);
  // If the enabledImage has no toolStateManager, create a default one for it
  // NOTE: This makes state management element specific

  if (enabledElement.toolStateManager === undefined) {
    enabledElement.toolStateManager = globalImageIdSpecificToolStateManager;
  }

  return enabledElement.toolStateManager;
}

/**
 * Adds tool state to the toolStateManager, this is done by tools as well
 * as modules that restore saved state.
 * @export @public @method
 * @name addToolState
 *
 * @param  {HTMLElement} element  The element.
 * @param  {string} toolType      The toolType of the state.
 * @param  {object} measurementData The data to store in the state.
 */
function addToolState (element, toolType, measurementData) {
  const toolStateManager = getElementToolStateManager(element);

  toolStateManager.add(element, toolType, measurementData);

  const eventType = EVENTS.MEASUREMENT_ADDED;
  const eventData = {
    toolType,
    element,
    measurementData
  };

  triggerEvent(element, eventType, eventData);
}

/**
 * Returns tool specific state of an element. Used by tools as well as modules
 * that save state persistently
 * @export @public @method
 * @name getToolState
 *
 * @param  {HTMLElement} element The element.
 * @param  {string} toolType The toolType of the state.
 * @return {object}          The element's state for the given toolType.
 */
function getToolState (element, toolType) {
  const toolStateManager = getElementToolStateManager(element);

  return toolStateManager.get(element, toolType);
}


/**
 * Removes specific tool state from the toolStateManager.
 * @export @public @method
 * @name removeToolState
 *
 * @param  {HTMLElement} element  The element.
 * @param  {string} toolType      The toolType of the state.
 * @param  {object} data          The data to remove from the toolStateManager.
 */
function removeToolState (element, toolType, data) {
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
      measurementData: data
    };

    triggerEvent(element, eventType, eventData);
  }
}

/**
 * Removes all toolState from the toolStateManager corresponding to
 * the toolType and element.
 * @export @public @method
 * @name clearToolState
 *
 * @param  {HTMLElement} element  The element.
 * @param  {string} toolType      The toolType of the state.
 */
function clearToolState (element, toolType) {
  const toolStateManager = getElementToolStateManager(element);
  const toolData = toolStateManager.get(element, toolType);

  // If any toolData actually exists, clear it
  if (toolData !== undefined) {
    toolData.data = [];
  }
}

/**
 * Sets the tool state manager for an element
 * @export @public @method
 * @name setElementToolStateManager
 *
 * @param  {HTMLElement} element The element.
 * @param {object} toolStateManager The toolStateManager.
 */
function setElementToolStateManager (element, toolStateManager) {
  const enabledElement = external.cornerstone.getEnabledElement(element);

  enabledElement.toolStateManager = toolStateManager;
}

export {
  addToolState,
  getToolState,
  removeToolState,
  clearToolState,
  setElementToolStateManager,
  getElementToolStateManager
};
