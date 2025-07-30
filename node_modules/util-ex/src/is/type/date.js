import objectToString from '../../object-to-string.js';
import isObject from './object.js';

const dateClass = '[object Date]';

/**
 *   Determines whether a value is a date object.
 *   @param {any} d - The value to check.
 *   @returns {boolean} - Returns `true` if `d` is a date object, else `false`.
 */
export function isDate(d) {
  return isObject(d) && objectToString(d) === dateClass;
};
export default isDate;
