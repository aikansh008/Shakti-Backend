/*
 * Usage:
 *   var fn = _createFunction('function yourFuncName(arg1, arg2){log(arg1+arg2);}', {log:console.log});
 *
 *   _createFunction('function abc(){}');
 *   _createFunction('function abc(){}', {log:console.log})
 *   _createFunction('function abc(){}', ['log'], [console.log])
 *
 * fn.toString() is :
 * "function yourFuncName(arg1, arg2) {
 *    return log(arg1+arg2);
 *  }"
 */

import isObject from "./is/type/object.js";
import isArray from "./is/type/array.js";

/**
 * Create a function using the given body and scope.
 *
 * @param {string} body - The body of the function to create.
 * @param {object|string[]} [scope] - The scope of the function, as an object with key/value pairs or an array of strings.
 * @param {Array=} values - The values to use for the scope, if scope is an array.
 * @returns {function} - The created function.
 *
 * @example
 *   var fn = _createFunction('function yourFuncName(arg1, arg2){log(arg1+arg2);}', {log:console.log});
 *   fn(2,3); //print 5
 */
export function _createFunction(body, scope, values) {
  if (arguments.length === 1) {
    // eslint-disable-next-line no-new-func
    return Function(`return ${  body}`)();
  } else {
    if (!isArray(scope) || !isArray(values)) {
      if (isObject(scope)) {
        const keys = Object.keys(scope);
        values = keys.map((k) => {
          return scope[k];
        });
        scope = keys;
      } else {
        values = [];
        scope = [];
      }
    }
    // eslint-disable-next-line no-new-func
    return Function(scope, `return ${  body}`).apply(null, values);
  }
}

export default _createFunction;
