/**
 * Determines whether the given object is iterable.
 * @param {any} obj - The object to check.
 * @returns {obj is Iterable<any>} - Returns true if the object is iterable; otherwise, returns false.
 */
export function isIterable(obj) {
  return !!obj && typeof obj[Symbol.iterator] === 'function';
}
