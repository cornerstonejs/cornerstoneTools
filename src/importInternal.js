import { lib } from './lib.js';

/**
 * Imports functionality from cornerstoneTools for use in external packages/plugins.
 * @param  {string} uri the import path for the entity to import.
 * @returns {Class|Object|Function} The entity requested.
 */
export default function(uri) {
  return lib[uri];
}
