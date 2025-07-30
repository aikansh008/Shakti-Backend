const int = /^(?:[-+]?(?:0|(?:0[xX])?[0-9]*))$/;

/**
 *   Checks if a given string represents an integer number.
 *   @param {string} str - The string to check.
 *   @returns {boolean} Whether or not the string represents an integer.
 *   @example
 *   isIntStr('42'); // true
 *   isIntStr('0'); // true
 *   isIntStr('-123'); // true
 *   isIntStr('12.3'); // false
 *   isIntStr('1e3'); // false
 */
export function isIntStr(str) {
  return str !== '' && int.test(str);
};
export default isIntStr;
