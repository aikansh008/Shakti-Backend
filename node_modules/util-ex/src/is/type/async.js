/**
 * Checks if a given value is an asynchronous function or a Promise.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} - Returns true if the value is an asynchronous function or a Promise, otherwise false.
 */
export function isAsync(value) {
  if (!value) return false
  let result = value instanceof Promise
  if (!result && typeof value === 'function') {
    result = value.constructor.name === 'AsyncFunction'
    if (!result) {
      result = value.constructor.name === 'AsyncGeneratorFunction'
    }
  }
  return result
}
