/**
 * Determines if a string represents a valid JavaScript RegExp.
 * @param {string} aRegExpString - The string to test.
 * @returns {boolean} - True if the string represents a valid EegExp, false otherwise.
 * @example
* isRegExpStr('/[a-z]/g') // true
* isRegExpStr('/not a regexp') // false
*/
export function isRegExpStr(value) {
  const result = typeof value === 'string' && value.length > 2 && value[0] === '/' && value.lastIndexOf('/') > 0
  return result
};
export default isRegExpStr;
