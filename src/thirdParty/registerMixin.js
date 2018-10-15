import { lib } from '../lib.js';
import mixins from '../mixins/index.js';

/**
 * Register an mixin to cornerstoneTools.
 * @export @private @method
 * @name registerMixin
 *
 * @param {string} name The name of the mixin.
 * @param {Object} mixin The mixin itself.
 * @param {boolean} [overwrite=false] Whether an mixin should be overwritten,
 *                                    should it have the same name.
 */
export default function (name, mixin, overwrite = false) {
  if (isMixinRegistered(name)) {
    console.warn(`mixins/${name} is already registered`);

    if (overwrite) {
      console.warn(`Overwriting mixins/${name}`);
    } else {
      return;
    }
  }

  // Register to the mixins object
  mixins[name] = mixin;

  // Reference the mixin from the library so it can be exported externally.
  lib[`mixins/${name}`] = mixins[name];

}

function isMixinRegistered (name) {
  return mixins[name] !== undefined;
}
