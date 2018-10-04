import { lib } from './import.js';



/**
 * Registers the item to the importLibrary.
 *
 * @param  {string} namespace The plugin namespace.
 * @param  {string} type      The item type.
 * @param  {string} name      The name of the item
 * @param  {Object|Function} payload the item itself.
 * @param  {boolean} [overwrite] Pass true to overwrite a previously registered item.
 */
export default function (namespace, type, name, payload, overwrite = false) {

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


function buildPathIfNonExistant (namespace, type) {
  if (!lib[namespace]) {
    lib[namespace] = {};
  }

  if (!lib[namespace][type]) {
    lib[namespace][type] = {};
  }
}
