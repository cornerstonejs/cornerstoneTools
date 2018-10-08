import { lib } from './lib.js';

/**
 * anonymous function - description
 *
 * @param  {string} item the import path for the entity to import.
 * @return {Class|Object}
 */
export default function (uri) {
  const splitUri = uri.split('/');
  const depth = splitUri.length;

  let [namespace, directory, item] = splitUri;

  if (depth > 3) {
    console.warn(`${uri} doesn't exist, too deep.`);
  }

  // Check that whatever is being requested exists.
  if (depth >= 1 && !lib[namespace]) {
    console.warn(`Namespace ${namespace} does not exist.`);
    return;
  }

  if (depth >= 2 && !lib[namespace][directory]) {
    console.warn(`${namespace}/${directory} does not exist.`);
    return;
  }

  if (depth === 3 && !lib[namespace][directory][item]) {
    console.warn(`${namespace}/${directory}/${item} does not exist.`);
    return;
  }

  switch (depth) {
    case 1:
      return lib[namespace];
    case 2:
      return lib[namespace][directory];
    case 3:
      return lib[namespace][directory][item];
  }
}
