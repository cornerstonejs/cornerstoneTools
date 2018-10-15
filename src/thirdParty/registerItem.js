import { lib } from '../lib.js';

/**
 * Register an item to cornerstoneTools.
 * @export @private @method
 * @name registerItem
 *
 * @param {string} type The type of the item.
 * @param {string} name The name of the item.
 * @param {Object|function} item The item itself.
 * @param {boolean} [overwrite=false] Whether an item should be overwritten,
 *                                    should it have the same name.
 */
export default function (type, name, item, overwrite = false) {
  if (isItemNameRegistered(type, name)) {
    console.warn(`${type}/${name} is already registered`);

    if (overwrite) {
      console.warn(`Overwriting ${type}/${name}`);
    } else {
      return;
    }
  }

  lib[`${type}/${name}`] = item;
}

function isItemNameRegistered (type, name) {
  return lib[`${type}/${name}`] !== undefined;
}
