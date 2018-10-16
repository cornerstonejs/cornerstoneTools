import { lib } from './lib.js';

/**
 * Imports functionality from cornerstoneTools for use in external packages/plugins.
 * @export @public @method
 * @name import
 *
 * @param  {string} uri the import path for the entity to import.
 * @return {Class|Object|Function} The entity requested.
 */
export default function (uri) {
  return lib[uri];
}
