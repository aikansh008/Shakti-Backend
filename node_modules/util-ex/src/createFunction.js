import _createFunc from "./_create-function.js";

/*
 * Usage:
 *   var fn = createFunction('yourFuncName', ['arg1', 'arg2'], 'return log(arg1+arg2);', {log:console.log});
 *
 * fn.toString() is :
 * "function yourFuncName(arg1, arg2) {
 *    return log(arg1+arg2);
 *  }"
 */

/**
 * Creates a new function with the given name, arguments, and body, and optionally with the given scope and values.
 *
 * @param {string} name - The name of the function.
 * @param {string|string[]=} [aArgs] - An array of argument names. or function body if it's string.
 * @param {string} [body] - The function body as a string.
 * @param {(string[]|Object)} [scope] - An array of scope names, or an object with scope names as keys and their corresponding values as values.
 * @param {Array} [values] - An array of values corresponding to the scope names, if scope is an array.
 * @returns {Function} - The newly created function.
 *
 * @example
 *
 * // Create a function with no arguments, with scope 'Math' and values [Math]:
 * var f = createFunction('myFunc', 'return Math.PI', ['Math'], [Math]);
 * var f = createFunction('myFunc', 'return Math.PI', {Math: Math});
 *
 * // Create a function with two arguments, with scope 'Math' and values [Math], and scope 'console' and values [console]:
 * var g = createFunction('myFunc', ['a', 'b'], 'console.log(a + b);', ['Math', 'console'], [Math, console]);
 * var g = createFunction('myFunc', ['a', 'b'], 'console.log(a + b);', {Math, console});
 */
export function createFunction(name, aArgs, body, scope, values) {
  if (arguments.length === 1) {
    return _createFunc(`function ${  name  }(){}`);
  }
  if (typeof aArgs === 'string') {
    values = scope;
    scope = body;
    body = aArgs;
    aArgs = [];
  } else if (aArgs == null) {
    aArgs = [];
  }
  body = `function ${  name  }(${  aArgs.join(', ')  }) {\n${  body  }\n}`;
  return _createFunc(body, scope, values);
};
export default createFunction;
