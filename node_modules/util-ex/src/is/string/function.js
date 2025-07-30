/**
 * Determines if a string represents a valid JavaScript function.
 * @param {string} aFuncString - The string to test.
 * @returns {boolean} - True if the string represents a valid function, false otherwise.
 * @example
 * isFunctionStr('function add(x, y) { return x + y; }') // true
 * isFunctionStr('const x = 5;') // false
 */
export function isFunctionStr(aFuncString) {
  const result = /^[;\s]*(async\s+)?function(\s+\S*)?\s*\(.*\)\s*{.*?}[;\s]*$/s.test(aFuncString);
  return result;
};
export default isFunctionStr;
