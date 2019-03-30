import { lib } from '../lib.js';
import mixins from '../mixins/index.js';
import { getLogger } from '../util/logger.js';

const logger = getLogger('thirdParty:registerMixin');
/**
 * Register an mixin to cornerstoneTools.
 * @export
 * @private
 * @method
 * @name registerMixin
 *
 * @param {string} name The name of the mixin.
 * @param {Object} mixin The mixin itself.
 * @param {boolean} [overwrite=false] Whether an mixin should be overwritten,
 *                                    should it have the same name.
 * @returns {void}
 */

export default function(name, mixin, overwrite = false) {
  const alreadyRegistered = isMixinRegistered(name);

  if (alreadyRegistered && !overwrite) {
    logger.warn('mixins/%s is already registered', name);

    return;
  }

  if (alreadyRegistered) {
    logger.warn('Overwriting mixins/%s', name);
  }

  // Register to the mixins object
  mixins[name] = mixin;

  // Reference the mixin from the library so it can be exported externally.
  lib[`mixins/${name}`] = mixins[name];
}

function isMixinRegistered(name) {
  return mixins[name] !== undefined;
}
