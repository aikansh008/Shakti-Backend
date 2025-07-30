const float = /^(?:[-+]?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/;

/**
 * Checks if a string represents a valid floating point number.
 * @param {string} str The string to test.
 * @returns {boolean} `true` if the string represents a valid floating point number, `false` otherwise.
 * @example
 * isFloatStr('3.14'); // returns true
 * isFloatStr('-0.5'); // returns true
 * isFloatStr('2.718e0'); // returns true
 * isFloatStr('2.718e-2'); // returns true
 * isFloatStr('abc'); // returns false
 */
export function isFloatStr(str) {
  return str !== '' && float.test(str);
};
export default isFloatStr;
