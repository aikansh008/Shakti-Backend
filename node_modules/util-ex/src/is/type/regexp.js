import objectToString from '../../object-to-string.js';
import isObject from './object.js';

const regexpClass = '[object RegExp]';
export function isRegExp(v) {
  return isObject(v) && objectToString(v) === regexpClass;
};
export default isRegExp;
