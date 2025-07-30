import objectToString from '../../object-to-string.js';
import isObject from './object.js';

export function isError(e) {
  return isObject(e) && objectToString(e) === '[object Error]';
};
export default isError;
