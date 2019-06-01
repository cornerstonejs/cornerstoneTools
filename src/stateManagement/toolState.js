import EVENTS from '../events.js';
import external from '../externalModules.js';
import { globalImageIdSpecificToolStateManager } from './imageIdSpecificStateManager.js';
import triggerEvent from '../util/triggerEvent.js';

function compare ( x, y ) {
  if ( x === y ) return true;
    // if both x and y are null or undefined and exactly the same

  if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;
    // if they are not strictly equal, they both need to be Objects

  if ( x.constructor !== y.constructor ) return false;
    // they must have the exact same prototype chain, the closest we can do is
    // test there constructor.

  for ( var p in x ) {
    if ( ! x.hasOwnProperty( p ) ) continue;
      // other properties were tested using x.constructor === y.constructor

    if ( ! y.hasOwnProperty( p ) ) return false;
      // allows to compare x[ p ] and y[ p ] when set to undefined

    if ( x[ p ] === y[ p ] ) continue;
      // if they have the same strict value or identity then they are equal

    if ( typeof( x[ p ] ) !== "object" ) return false;
      // Numbers, Strings, Functions, Booleans must be strictly equal

    if ( ! compare( x[ p ],  y[ p ] ) ) return false;
      // Objects and Arrays must be tested recursively
  }

  for ( p in y ) {
    if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) return false;
      // allows x[ p ] to be set to undefined
  }
  return true;
}

function getElementToolStateManager (element) {
  const enabledImage = external.cornerstone.getEnabledElement(element);
  // If the enabledImage has no toolStateManager, create a default one for it
  // NOTE: This makes state management element specific

  if (enabledImage.toolStateManager === undefined) {
    enabledImage.toolStateManager = globalImageIdSpecificToolStateManager;
  }

  return enabledImage.toolStateManager;
}

// Here we add tool state, this is done by tools as well
// As modules that restore saved state
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

// Here you can get state - used by tools as well as modules
// That save state persistently
function getToolState (element, toolType) {
  const toolStateManager = getElementToolStateManager(element);


  return toolStateManager.get(element, toolType);
}

function removeToolState (element, toolType, data) {
  const toolStateManager = getElementToolStateManager(element);
  const toolData = toolStateManager.get(element, toolType);
  // Find this tool data
  let indexOfData = -1;

  for (let i = 0; i < toolData.data.length; i++) {
    if (compare(toolData.data[i], data)) {
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

function clearToolState (element, toolType) {
  const toolStateManager = getElementToolStateManager(element);
  const toolData = toolStateManager.get(element, toolType);

  // If any toolData actually exists, clear it
  if (toolData !== undefined) {
    toolData.data = [];
  }
}

// Sets the tool state manager for an element
function setElementToolStateManager (element, toolStateManager) {
  const enabledImage = external.cornerstone.getEnabledElement(element);

  enabledImage.toolStateManager = toolStateManager;
}

export {
  addToolState,
  getToolState,
  removeToolState,
  clearToolState,
  setElementToolStateManager,
  getElementToolStateManager
};
