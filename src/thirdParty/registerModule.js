import { state, modules } from '../store/index.js';

/**
 * Register a module.
 *
 * @param  {Object} newModule The module to register.
 * @param {string} name - The name of the module.
 */
export default function (newModule, name) {
  if (isModuleNameRegistered(name)) {
    console.warning(`A module with the name ${name} is already registered`);

    return;
  }

  modules[name] = newModule;

  // Initialise module
  if (typeof newModule.onRegisterCallback === 'function') {
    newModule.onRegisterCallback(name);
  }

  // Element specific initilisation
  if (typeof newModule.enabledElementCallback === 'function') {
    const enabledElements = state.enabledElements;

    for (let i = 0; i < enabledElements.length; i++) {
      newModule.enabledElementCallback();
    }
  }
}


function isModuleNameRegistered (name) {
  return Object.keys(modules).some((key) => {
    return key === name;
  });
}
