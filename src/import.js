import { lib } from './lib.js';

/**
 * Imports functionality from cornerstoneTools for use in external packages/plugins.
 *
 * @param  {string} uri the import path for the entity to import.
 * @return {Class|Object|Function} The entity requested.
 */
export default function (uri) {
  return lib[uri];


  /*

  const splitUri = uri.split('/');
  const depth = splitUri.length;

  let [type, item] = splitUri;

  if (depth > 2) {
    console.warn(`${uri} doesn't exist, directory level too deep.`);
  }

  // Check that whatever is being requested exists.
  if (depth >= 1 && !lib[type]) {
    console.warn(`Type ${type} does not exist.`);
    return;
  }

  console.log(lib[type]);

  if (depth === 2 && !lib[type][item]) {
    console.warn(`${type}/${item} does not exist.`);
    return;
  }

  switch (depth) {
    case 1:
      return lib[type];
    case 2:
      return lib[type][item];
  }
  */
}
