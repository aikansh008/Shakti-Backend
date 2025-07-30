import isObject from './object.js';
export function isPlainObject(arg) {
  let ctor
  let prot
  return isObject(arg) && ((ctor = arg.constructor) === undefined ||
    (isObject(prot=ctor.prototype) && prot.hasOwnProperty('isPrototypeOf')));
};

export default isPlainObject;
