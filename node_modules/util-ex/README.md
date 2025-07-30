### util-ex [![Build Status](https://img.shields.io/travis/snowyu/util-ex.js/master.png)](http://travis-ci.org/snowyu/util-ex.js) [![npm](https://img.shields.io/npm/v/util-ex.svg)](https://npmjs.org/package/util-ex) [![downloads](https://img.shields.io/npm/dm/util-ex.svg)](https://npmjs.org/package/util-ex) [![license](https://img.shields.io/npm/l/util-ex.svg)](https://npmjs.org/package/util-ex)

Enhanced utils

This package modifies and enhances the standard `util` from node.js


# API

Full API Documents is here: [Docs](./docs/modules.md)

## inject

▸ **inject**(`aOrgFunc`, `aBeforeExec`, `aAfterExec`): `Function`

Wraps a function and executes code before and/or after the wrapped function.

**`Throws`**

If aAfterExec is not a function and an error occurs while executing the wrapped function.

**`Example`**

```js
import { inject as injectFunc } from 'util-ex'

// Wrapping a function with injectFunc
const originalFunc = (a, b) => a + b;
const beforeFunc = (a, b) => console.log(`Before execution: a = ${a}, b = ${b}`);
const afterFunc = (result) => console.log(`After execution: result = ${result}`);
const wrappedFunc = injectFunc(originalFunc, beforeFunc, afterFunc);
const result = wrappedFunc(1, 2); // Logs "Before execution: a = 1, b = 2" and "After execution: result = 3"
```

**`Example`**

```js
// Wrapping a function with injectFunc and modifying arguments and return value
const Arguments = injectFunc.Arguments
const originalFunc = (a, b) => a + b;
const beforeFunc = (a, b) => {
  console.log(`Before execution: a = ${a}, b = ${b}`);
  return new Arguments([a * 2, b * 3]);
};
const afterFunc = (result, isDenied) => {
  console.log(`After execution: result = ${result}, isDenied = ${isDenied}`);
  return result * 2;
};
const wrappedFunc = injectFunc(originalFunc, beforeFunc, afterFunc);
const result = wrappedFunc(1, 2); // Logs "Before execution: a = 1, b = 2", "After execution: result = 6, isDenied = false"
console.log(result); // Output: 12
```

**`Example`**

```js
// Wrapping a function with injectFunc and not executing the original function
const originalFunc = (a, b) => a + b;
const beforeFunc = (a, b) => {
  console.log(`Before execution: a = ${a}, b = ${b}`);
  return "Not executing original function";
};
const afterFunc = (result, isDenied) => {
  console.log(`After execution: result = ${result}, isDenied = ${isDenied}`);
  return "Modified return value";
};
const wrappedFunc = injectFunc(originalFunc, beforeFunc, afterFunc);
const result = wrappedFunc(1, 2); // Logs "Before execution: a = 1, b = 2", "After execution: result = Modified return value, isDenied = true"
console.log(result); // Output: "Modified return value"
```

**`Example`**

```js
// Wrapping a function with injectFunc and getting the original function's error
const originalFunc = () => {
  throw new Error("Original function error");
};
const beforeFunc = () => {
  console.log("Before execution");
};
const afterFunc = (result, isDenied) => {
  console.log(`After execution: result = ${result}, isDenied = ${isDenied}`);
};
const wrappedFunc = injectFunc(originalFunc, beforeFunc, afterFunc);
wrappedFunc(); // Logs "Before execution", "After execution: result = [Error: Original function error], isDenied = false"
```

### inject Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `aOrgFunc` | `Function` | The function to be wrapped. |
| `aBeforeExec` | `Function` | A function to be executed before the wrapped function `aOrgFunc`. |
| `aAfterExec` | `Function` | A function to be executed after the wrapped function `aOrgFunc`. |

### inject Returns

`Function`

A new function that wraps the original function.

BeforeExec:
If `aBeforeExec` is a function, it will be called with the same context and arguments as the wrapped function.

- If it returns an `Arguments` object, the wrapped function will be called with the modified arguments.
- If it returns a value other than `undefined`, the wrapped function will not be called and this value will be returned as result instead.

AfterExec:
If `aAfterExec` is a function, it will be called with the same context, arguments with additional the result of the `aOrgFunc` and isDenied flag.

- If the `aOrgFunc` throws an error, the `result` parameter will be an `Error` object.
- If `aAfterExec` returns a value, it will be used as the final result of the wrapped function.
- If `isDenied` parameter is true, it means `aOrgFunc` was not called during execution of the wrapped function.

## injectMethod

▸ **injectMethod**(`aObject`, `aMethodName`, `aNewMethod`): `boolean`

Injects method into an object. optionally preserving access to the original method via "`super`" and original instance via "`self`".

**Note**:

* In the new method, you can use `this.super()` to call the original method, `this.super()` is already bound with original instance.
* The `this[aMethodName]` is also the original method, but not bound yet.
* `this.self` is the original instance!

**`Example`**

```ts
import { injectMethod } from 'util-ex'

var obj = {
  method1: function() {
    console.log('Hello');
  }
};

var newMethod = function() {
  this.super();
  console.log('World');
};

injectMethod(obj, 'method1', newMethod);

obj.method1(); // Output: Hello\nWorld
```

### injectMethod Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `aObject` | `any` | the target object to inject |
| `aMethodName` | `string` | the target method to inject |
| `aNewMethod` | `Function` | the new method to be injected into the aObject. |

### injectMethod Returns

`boolean`

whether the injection is successful.

## newFunction

    newFunction(name, arguments, body[, scope[, values]])
    newFunction(functionString[, scope[, values]])

Creates a new function with the given name, arguments, body, scope and values.

* If only one argument is provided and it is a function, returns a new function with the same code.
* If only one argument is provided and it is not a function, returns a new empty function with the given name.
* If multiple arguments are provided, creates a new function with the given name, arguments and body.

```js
import { newFunction } from 'util-ex'

var fn = newFunction('yourFuncName', ['arg1', 'arg2'], 'return log(arg1+arg2);', {log:console.log})
newFunction('function yourFuncName(){}')
newFunction('function yourFuncName(arg1, arg2){return log(arg1+arg2);}', {log:console.log})
newFunction('function yourFuncName(arg1, arg2){return log(arg1+arg2);}', ['log'], [console.log])

//fn.toString() is :
/*
 "function yourFuncName(arg1, arg2) {
    return log(arg1+arg2);
 }"
*/
```

## defineProperty

    defineProperty(object, key, value[, aOptions])

Define a property on the object. move to [inherits-ex](https://github.com/snowyu/inherits-ex.js) package.


### usage

```js
const defineProperty = require('util-ex/lib/defineProperty')

let propValue = ''
const obj = {}

defineProperty(obj, 'prop', 'simpleValue')
defineProperty(obj, 'prop', undefined, {
  get() {return propValue}
  set(value) {propValue = value}
})
```

