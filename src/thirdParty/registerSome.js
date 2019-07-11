import register from './register.js';

/**
 * Register an array of items and/or modules to cornerstoneTools.
 * @export
 * @public
 * @method
 * @name registerSome
 *
 * @param {Object[]} items An array of items/modules to register.
 * @param {boolean} [overwrite=false] Whether an item/module should be
 *                                    overwritten, should it have the same name.
 * @returns {void}
 */
export default function(items, overwrite = false) {
  items.forEach(({ type, name, item }) => {
    register(type, name, item, overwrite);
  });
}
