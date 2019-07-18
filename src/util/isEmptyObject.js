/**
 * Helper to determine if an object has no keys and is the correct type (is empty)
 *
 * @private
 * @function isEmptyObject
 * @param {Object} obj The object to check
 * @returns {Boolean} true if the object is empty
 */
const isEmptyObject = obj =>
  Object.keys(obj).length === 0 && obj.constructor === Object;

export default isEmptyObject;
