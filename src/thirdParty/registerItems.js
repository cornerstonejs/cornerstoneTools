import { lib } from './import.js';



/**
 * Registers an array of items to the lib.
 *
 * @param  {string}   namespace The namespace to register to.
 * @param  {Object[]} items     The array of items.
 * @param  {booelan}  [overwrite] Whether the item may be overwritten if
 *                                is already defined.
 */
export default function (namespace, items, overwrite) {
  buildNamespaceIfNonExistant(namespace);

  for (let i = 0; i < items.length; i++) {
    const {
      type,
      name,
      payload
    } = items[i];

    registerOneItem(namespace, type, name, payload, overwrite);
  }
}


/**
 * Registers the item to the lib.
 *
 * @param  {string} namespace The plugin namespace.
 * @param  {string} type      The item type.
 * @param  {string} name      The name of the item
 * @param  {Object|Function} payload the item itself.
 * @param  {boolean} [overwrite] Pass true to overwrite a previously registered item.
 */
function registerOneItem (namespace, type, name, payload, overwrite = false) {
  if (!overwrite && doesItemExist(namespace, type, name)) {
    console.warn(`A mixin with the name ${name} is already registered`);

    return;
  }

  buildPathIfNonExistant(namespace, type);

  lib[namespace][type][name] = payload;
}


function doesItemExist (namespace, type, name) {
  return lib[namespace] && lib[namespace][type] && lib[namespace][type][name];
}

function buildNamespaceIfNonExistant (namespace) {
  if (!lib[namespace]) {
    lib[namespace] = {};
  }
}

function buildPathIfNonExistant (namespace, type) {
  if (!lib[namespace][type]) {
    lib[namespace][type] = {};
  }
}
