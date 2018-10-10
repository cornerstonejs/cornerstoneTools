import { lib } from '../lib.js';

/**
 * Register an item to cornerstoneTools.
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

  // TODO: Should we allow users to add new types? Maybe we should restrict it?
  if (!lib[type]) {
    lib[type] = {};
  }

  lib[type][name] = item;
}

function isItemNameRegistered (type, name) {
  return lib[type] !== undefined && lib[type][name] !== undefined;
}
