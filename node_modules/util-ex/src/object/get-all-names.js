
/**
 * Get all names of an object, include non-enumerable properties.
 * @param {object} obj - The object to get names from
 * @param {boolean} [inherited] - whether includes inherited properties, defaults to true
 * @returns {string[]} An array of all names of the object
 */
export function getAllNames(obj, inherited) {
  const keys = new Set();
  // if primitive (primitives still have keys) skip the first iteration
  if (!(obj instanceof Object)) {
      obj = Object.getPrototypeOf(obj)
  }
  if (inherited !== false) {
    while (obj) {
      Reflect.ownKeys(obj).forEach(keys.add, keys);
      obj = Object.getPrototypeOf(obj);
    }
  } else {
    Reflect.ownKeys(obj).forEach(keys.add, keys);
  }
  return Array.from(keys);
}

export default getAllNames;
