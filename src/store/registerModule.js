import { state, modules } from './index.js';

/**
 * registerModule - register a module to the store.
 *
 * @param  {Object} newModule The module to register.
 */
function registerModule (newModule) {
  Object.assign(modules, newModule);

  // Initialise module
  if (typeof newModule.initCallback === 'function') {
    newModule.initCallback();
  }

  // Element specific initilisation
  if (typeof newModule.initSpecificElementCallback === 'function') {
    const enabledElements = state.enabledElements;

    for (let i = 0; i < enabledElements.length; i++) {
      newModule.initSpecificElementCallback();
    }
  }
}
