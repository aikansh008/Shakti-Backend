import { isRegExp } from "./is/type/regexp.js"

/**
 * create or clone RegExp
 * @param {string|RegExp} value - create a new RegExp from.
 * @returns {RegExp} - new RegExp instance.
 * @example
 * toRegExp('/[a-z]/g') // new RegExp(/[a-z]/g)
 * toRegExp(/[a-z]/g)  // new RegExp(/[a-z]/g)
 */
export function toRegExp(value) {
  let result
  if (typeof value === 'string' && value.length > 2 && value[0] === '/') {
    const i = value.lastIndexOf('/')
    const source = value.slice(1, i)
    const flags = value.slice(i+1)
    result = new RegExp(source, flags)
  } else if (isRegExp(value)) {
    result = new RegExp(value.source, value.flags)
  }
  return result
};
export default toRegExp;
