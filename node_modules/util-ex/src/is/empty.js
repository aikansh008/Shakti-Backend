import isArguments from './type/arguments.js';
import isFunction from './type/function.js';
import isEmptyFunction from './empty-function.js';

const getOwnPropertyNames = Object.getOwnPropertyNames; // >=ECMAScript5 only

const argsClass = '[object Arguments]';
const arrayClass = '[object Array]';
// const boolClass = '[object Boolean]';
// const dateClass = '[object Date]';
// const errorClass = '[object Error]';
const funcClass = '[object Function]';
// const numberClass = '[object Number]';
const objectClass = '[object Object]';
// const regexpClass = '[object RegExp]';
const stringClass = '[object String]';

const support = {};

(function () {
  const Ctor = function () {
      this.x = 1;
    };
  // const object = {
  //   '0': 1,
  //   'length': 1
  // };
  const props = [];
  Ctor.prototype = {
    'valueOf': 1,
    'y': 1
  };
  for (const key in new Ctor()) {
    props.push(key);
  }
  // for (let key in arguments) {}

  /**
   * Detect if an `arguments` object's [[Class]] is resolvable (all but Firefox < 4, IE < 9).
   *
   * @memberOf _.support
   * @type boolean
   */
  support.argsClass = toString.call(arguments) === argsClass;
})(1);

/**
 * Checks if a given value is empty.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} - Returns `true` if the value is empty, else `false`.
 */
export function isEmpty(value) {
  const result = true;
  if (!value) {
    return result;
  }
  const className = toString.call(value);
    const length = value.length;
  if (className === arrayClass || className === stringClass ||
      (support.argsClass ? className === argsClass : isArguments(value)) ||
      className === objectClass && typeof length === 'number' && isFunction(value.splice)) {
    return !length;
  }
  if (className === funcClass) {
    return isEmptyFunction(value);
  }
  if (getOwnPropertyNames(value).length > 0) {return false;}
  /*
  for (var key in value) {
    if (hasOwnProperty.call(value, key)) return false;
  }
  */
  return result;
};
export default isEmpty;
