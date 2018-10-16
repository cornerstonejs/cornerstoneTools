import { state, modules } from '../store/index.js';

/**
 * Register a module.
 * @export @private @method
 * @name registerModule
 *
 * @param {string} name The name of the module.
 * @param {Object} newModule The module to register.
 * @param {boolean} [overwrite] Whether a module should be overwritten,
 *                              should it have the same name.
 */
export default function (name, newModule, overwrite = false) {
  if (isModuleNameRegistered(name)) {
    console.warn(`A module with the name ${name} is already registered`);

    if (overwrite) {
      console.warn(`Overwriting module ${name}`);
    } else {
      return;
    }
  }

  modules[name] = newModule;
}

function isModuleNameRegistered (name) {
  return Object.keys(modules).some((key) => {
    return key === name;
  });
}
