import { modules } from '../store/index.js';
import { getLogger } from '../util/logger.js';

const logger = getLogger('thirdParty:registerModule');

/**
 * Register a module.
 * @export
 * @private
 * @method
 * @name registerModule
 *
 * @param {string} name The name of the module.
 * @param {Object} newModule The module to register.
 * @param {boolean} [overwrite] Whether a module should be overwritten,
 *                              should it have the same name.
 * @returns {void}
 */
export default function(name, newModule, overwrite = false) {
  const alreadyRegistered = isModuleNameRegistered(name);

  if (alreadyRegistered && !overwrite) {
    logger.warn('A module with the name %s is already registered', name);

    return;
  }

  if (alreadyRegistered) {
    logger.warn('Overwriting module %s', name);
  }

  modules[name] = newModule;

  if (typeof modules[name].onRegisterCallback === 'function') {
    modules[name].onRegisterCallback();
  }
}

function isModuleNameRegistered(name) {
  return modules[name] !== undefined;
}
