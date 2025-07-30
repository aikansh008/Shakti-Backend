/**
 * Check if an object is empty.
 * @param {Object} obj - The object to be checked.
 * @returns {boolean} - Whether the object is empty or not.
 */
export function isEmptyObject(obj) {
  // eslint-disable-next-line no-unreachable-loop
  for (const k in obj) {
    return false;
  }
  return true;
};
export default isEmptyObject;
