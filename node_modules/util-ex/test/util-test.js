import sinonChai from "sinon-chai";
import sinon from "sinon";
import chai from "chai";
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();
chai.use(sinonChai);


import {
  isEmpty,
  isEmptyFunction,
  isEmptyObject,
  _extend,
  inject,
  isRegExp,
  isDate,
  isUndefined,
  isNullOrUndefined,
  isObject,
  isFunctionStr,
  isString,
} from "../src/index.js";

import extend from '../src/extend.js';
import log from '../src/log.js';

describe("isEmptyObject", function () {
  it("should be empty", function () {
    assert.ok(isEmptyObject(null));
    assert.ok(isEmptyObject({}));
    assert.notOk(isEmptyObject({
      length: 0
    }));
    assert.notOk(isEmptyObject({
      k: undefined
    }));
  });
});
describe("isEmpty", function () {
  it("should be empty", function () {
    assert.ok(isEmpty(null));
    assert.ok(isEmpty(""));
    assert.ok(isEmpty({}));
    assert.ok(isEmpty([]));
    (function () {
      assert.ok(isEmpty(arguments));
    })();
    assert.notOk(isEmpty("hi"));
    assert.notOk(isEmpty({
      length: 0
    }));
    assert.notOk(isEmpty([1]));
    (function () {
      assert.notOk(isEmpty(arguments));
    })(1);
  });
  return it("should be empty function", function () {
    var emptyFunc = function () {};
    isEmpty(emptyFunc).should.be.true;
    emptyFunc = function (abc, ase) {};
    isEmpty(emptyFunc).should.be.true;
    isEmptyFunction("function(arg1, arg2, arg3){\n}").should.be.true;
    isEmptyFunction("function(arg1, arg2, arg3){\n;}").should.be.true;
    isEmptyFunction("function   asFn  (arg1, arg2, arg3){\n\n;}").should.be.true;
    expect(isEmptyFunction("function(arg1, arg2, arg3){abs;}")).not.to.true;
  });
});
describe("inject", function () {
  it("should inject a function before execution", function () {
    var onBefore, run;
    run = function (a, b, c) {
      return [a, b, c];
    };
    onBefore = sinon.spy();
    run = inject(run, onBefore);
    run(1, "b", 3).should.be.deep.equal([1, "b", 3]);
    onBefore.should.have.been.calledWith(1, "b", 3);
    onBefore.should.have.been.calledOnce;
  });
  it("should inject a function before execution and change the arguments", function () {
    var onBefore, run, runOrg;
    runOrg = sinon.spy(function (a, b, c) {
      return [a, b, c];
    });
    onBefore = sinon.spy(function (a, b, c) {
      arguments[0] = a = 2;
      arguments[1] = b = "B";
      arguments[2] = c = 4;
      return arguments;
    });
    run = inject(runOrg, onBefore);
    run(1, "b", 3).should.be.deep.equal([2, "B", 4]);
    onBefore.should.have.been.calledWith(1, "b", 3);
    onBefore.should.have.been.calledOnce;
    runOrg.should.have.been.calledOnce;
  });
  it("should inject a function before execution and deny the original function execution", function () {
    var onBefore, run, runOrg;
    runOrg = sinon.spy(function (a, b, c) {
      return [a, b, c];
    });
    onBefore = sinon.spy(function () {
      return false;
    });
    run = inject(runOrg, onBefore);
    run(1, "b", 3).should.be.false;
    onBefore.should.have.been.calledWith(1, "b", 3);
    onBefore.should.have.been.calledOnce;
    runOrg.should.have.not.been.called;
  });
  it("should inject a function after execution", function () {
    var onAfter, run, runOrg;
    runOrg = sinon.spy(function (a, b, c) {
      return [a, b, c];
    });
    onAfter = sinon.spy(function (a, b, c, result, isDenied) {
      a.should.be.equal(1);
      b.should.be.equal("b");
      c.should.be.equal(3);
      result.should.be.deep.equal([1, "b", 3]);
      isDenied.should.be.false;
    });
    run = inject(runOrg, null, onAfter);
    run(1, "b", 3).should.be.deep.equal([1, "b", 3]);
    onAfter.should.have.been.calledWith(1, "b", 3);
    onAfter.should.have.been.calledOnce;
    runOrg.should.have.been.calledOnce;
  });
  it("should inject a function after execution and change result", function () {
    var onAfter, run, runOrg;
    runOrg = sinon.spy(function (a, b, c) {
      return [a, b, c];
    });
    onAfter = sinon.spy(function (a, b, c, result, isDenied) {
      a.should.be.equal(1);
      b.should.be.equal("b");
      c.should.be.equal(3);
      result.should.be.deep.equal([1, "b", 3]);
      isDenied.should.be.false;
      return [1, 2, 3];
    });
    run = inject(runOrg, null, onAfter);
    run(1, "b", 3).should.be.deep.equal([1, 2, 3]);
    onAfter.should.have.been.calledWith(1, "b", 3);
    onAfter.should.have.been.calledOnce;
    return runOrg.should.have.been.calledOnce;
  });
  it("should inject a function before and after execution", function () {
    var onAfter, onBefore, run, runOrg;
    runOrg = sinon.spy(function (a, b, c) {
      return [a, b, c];
    });
    onBefore = sinon.spy();
    onAfter = sinon.spy(function (a, b, c, result, isDenied) {
      a.should.be.equal(1);
      b.should.be.equal("b");
      c.should.be.equal(3);
      result.should.be.deep.equal([1, "b", 3]);
      isDenied.should.be.false;
    });
    run = inject(runOrg, onBefore, onAfter);
    run(1, "b", 3).should.be.deep.equal([1, "b", 3]);
    onBefore.should.have.been.calledWith(1, "b", 3);
    onBefore.should.have.been.calledOnce;
    onAfter.should.have.been.calledWith(1, "b", 3);
    onAfter.should.have.been.calledOnce;
    runOrg.should.have.been.calledOnce;
  });
});
describe("isRegExp", function () {
  it("should check a RegExp instance correct", function () {
    isRegExp(/ahi/).should.be.true;
    isRegExp(new RegExp()).should.be.true;
  });
  it("should check an illegal RegExp argument correct", function () {
    isRegExp().should.be.false;
    isRegExp(RegExp).should.be.false;
    return isRegExp("/sdd/g").should.be.false;
  });
});
describe("isDate", function () {
  it("should check a Date instance correct", function () {
    isDate(new Date()).should.be.true;
    return isDate(new Date(2015, 1, 1)).should.be.true;
  });
  it("should check an illegal date argument correct", function () {
    isDate().should.be.false;
    isDate(Date).should.be.false;
    return isDate("2015-01-01").should.be.false;
  });
});
describe("isUndefined", function () {
  it("should check undefined type correct", function () {
    isUndefined(void 0).should.be.true;
    return isUndefined(undefined).should.be.true;
  });
  return it("should check an other type to false", function () {
    isUndefined(null).should.be.false;
    isUndefined(Date).should.be.false;
    isUndefined(false).should.be.false;
    isUndefined(0).should.be.false;
    return isUndefined('undefined').should.be.false;
  });
});
describe("isNullOrUndefined", function () {
  it("should check undefined type correct", function () {
    return isNullOrUndefined(void 0).should.be.true;
  });
  it("should check null type correct", function () {
    return isNullOrUndefined(null).should.be.true;
  });
  return it("should check an other type to false", function () {
    isNullOrUndefined(Date).should.be.false;
    isNullOrUndefined(false).should.be.false;
    isNullOrUndefined(0).should.be.false;
    return isNullOrUndefined('undefined').should.be.false;
  });
});
describe("isObject", function () {
  it("should check object type correct", function () {
    var Obj, obj;
    Obj = function () {};
    obj = Object.create(null);
    isObject({}).should.be.true;
    isObject(obj).should.be.true;
    isObject(new Obj()).should.be.true;
    isObject(new Date()).should.be.true;
    return isObject(/dd/).should.be.true;
  });
  return it("should check an other type to false", function () {
    isObject(null).should.be.false;
    isObject("object").should.be.false;
    isObject(false).should.be.false;
    isObject(true).should.be.false;
    isObject(0).should.be.false;
    isObject(function () {}).should.be.false;
  });
});
describe("isFunction", function () {
  it("should check function type correct", function () {
    isFunctionStr(function () {}).should.be.true;
    isFunctionStr(Date).should.be.true;
    isFunctionStr(RegExp).should.be.true;
  });
  return it("should check an other type to false", function () {
    isFunctionStr(new RegExp()).should.be.false;
    isFunctionStr(new function () {}()).should.be.false;
    isFunctionStr(false).should.be.false;
    isFunctionStr(true).should.be.false;
    isFunctionStr(0).should.be.false;
    isFunctionStr(null).should.be.false;
    isFunctionStr(void 0).should.be.false;
    isFunctionStr("").should.be.false;
  });
});
describe("isString", function () {
  it("should check string type correct", function () {
    isString("").should.be.true;
    isString("hello").should.be.true;
  });
  it("should check an other type to false", function () {
    isString(new RegExp()).should.be.false;
    isString(new function () {}()).should.be.false;
    isString(false).should.be.false;
    isString(true).should.be.false;
    isString(0).should.be.false;
    isString(null).should.be.false;
    isString(void 0).should.be.false;
  });
});

describe("_extend", function () {
  it("should extend an object", function () {
    var add, org;
    org = {
      a: 1,
      b: 2
    };
    add = {
      a: 3
    };
    _extend(org, add).should.be.equal(org);
    org.should.be.deep.equal({
      a: 3,
      b: 2
    });
    _extend(org, {
      b: 4,
      c: 2
    });
    org.should.be.deep.equal({
      a: 3,
      b: 4,
      c: 2
    });
  });
  it("should extend many object", function () {
    var add, org, third;
    org = {
      a: 1,
      b: 2
    };
    add = {
      a: 3
    };
    third = {
      c: 4
    };
    _extend(org, add, third, {
      d: 5,
      b: 0
    }).should.be.equal(org);
    org.should.be.deep.equal({
      a: 3,
      b: 0,
      c: 4,
      d: 5
    });
  });
});
describe("extend", function () {
  it("should extend an object", function () {
    var add, org;
    org = {
      a: 1,
      b: 2
    };
    add = {
      a: 3
    };
    extend(org, add).should.be.equal(org);
    org.should.be.deep.equal({
      a: 3,
      b: 2
    });
    extend(org, {
      b: 4,
      c: 2
    });
    return org.should.be.deep.equal({
      a: 3,
      b: 4,
      c: 2
    });
  });
  it("should extend many object", function () {
    var add, org, third;
    org = {
      a: 1,
      b: 2
    };
    add = {
      a: 3
    };
    third = {
      c: 4
    };
    extend(org, [add, third, {
      d: 5,
      b: 0
    }]).should.be.equal(org);
    org.should.be.deep.equal({
      a: 3,
      b: 0,
      c: 4,
      d: 5
    });
  });
  it("should extend an object and filter properties", function () {
    var add, org;
    org = {};
    add = {
      a: 3,
      b: 3,
      c: 2,
      d: 123
    };
    extend(org, add, function (k, v) {
      return k === 'a' || k === 'c';
    }).should.be.equal(org);
    org.should.be.deep.equal({
      a: 3,
      c: 2
    });
  });
});
