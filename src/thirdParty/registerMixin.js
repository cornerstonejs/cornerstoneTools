import mixins from '../mixins/index.js';

/**
 * Register a mixin.
 *
 * @param  {Object} newMixin The mixin to register.
 * @param {string} name The name of the mixin.
 */
export default function (newMixin, name) {

  if (isMixinNameRegistered(name)) {
    console.warn(`A mixin with the name ${name} is already registered`);

    return;
  }

  mixins[name] = newMixin;
}


function isMixinNameRegistered (name) {
  return Object.keys(mixins).some((key) => {
    return key === name;
  });
}
