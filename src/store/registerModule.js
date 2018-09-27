import { state, modules } from './index.js';

/**
 * registerModule - register a module to the store.
 *
 * @param  {Object} newModule The module to register.
 */
export default function (newModule, name) {
  if (isModuleNameRegistered(name)) {
    throw new Error(`A module with the name ${name} is already registered`);
  }

  modules[name] = newModule;


  Object.assign(modules, newModule);

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
