import sinonChai from "sinon-chai";
import sinon from "sinon";
import chai from "chai";
var assert = chai.assert;
var should = chai.should();
chai.use(sinonChai);

import createFunction from '../src/new-function.js';

describe("newFunction", function () {
  it("should create a function via string", function () {
    var fn;
    fn = createFunction("function  myFn(){}");
    should.exist(fn, "fn");
    fn.should.have.property('name', 'myFn');
    fn.should.have.length(0);
  });
  it("should create a function via string with args", function () {
    var fn;
    fn = createFunction("function myFn (arg1, arg2, arg3) \n {}\n");
    should.exist(fn, "fn");
    fn.should.have.property('name', 'myFn');
    fn.should.have.length(3);
  });
  it("should create a function via string with args and body new line", function () {
    var fn;
    fn = createFunction("function myFn (arg1, arg2, arg3) \n {\nreturn a\n}\n");
    should.exist(fn, "fn");
    fn.should.have.property('name', 'myFn');
    fn.should.have.length(3);
  });
  it("should create a function via string with specified scope", function () {
    var b, fn;
    b = 123;
    fn = createFunction("function myFn(arg1, arg2) {return arg1+arg2+b}", {
      b: b
    });
    should.exist(fn, "fn");
    fn.should.have.property('name', 'myFn');
    fn.should.have.length(2);
    fn(10, 2).should.be.equal(135);
  });
  it("should create a function via string with specified scope value array", function () {
    var b, fn;
    b = 123;
    fn = createFunction("function myFn(arg1, arg2) {return arg1+arg2+b}", ['b'], [b]);
    should.exist(fn, "fn");
    fn.should.have.property('name', 'myFn');
    fn.should.have.length(2);
    fn(10, 2).should.be.equal(135);
  });
  it("should create an empty named function", function () {
    var fn;
    fn = createFunction("myFn");
    should.exist(fn, "fn");
    fn.should.have.property('name', 'myFn');
    fn.should.have.length(0);
  });
  it("should create an empty named function with args", function () {
    var fn;
    fn = createFunction("myFn", ['arg1', 'arg2']);
    should.exist(fn, "fn");
    fn.should.have.property('name', 'myFn');
    fn.should.have.length(2);
  });
  it("should create a function", function () {
    var fn;
    fn = createFunction("myFn", ['arg1', 'arg2'], "return arg1+arg2");
    should.exist(fn, "fn");
    fn.should.have.property('name', 'myFn');
    fn.should.have.length(2);
    fn(10, 2).should.be.equal(12);
  });
  it("should create a function without args", function () {
    var fn;
    fn = createFunction("myFn", "return 'hello!'");
    should.exist(fn, "fn");
    fn.should.have.property('name', 'myFn');
    fn.should.have.length(0);
    fn().should.be.equal("hello!");
  });
  it("should create a function with specified scope", function () {
    var b, fn;
    b = 123;
    fn = createFunction("myFn", ['arg1', 'arg2'], "return arg1+arg2+b", {
      b: b
    });
    should.exist(fn, "fn");
    fn.should.have.property('name', 'myFn');
    fn.should.have.length(2);
    fn(10, 2).should.be.equal(135);
  });
  it("should create a function with specified scope value array", function () {
    var b, fn;
    b = 123;
    fn = createFunction("myFn", ['arg1', 'arg2'], "return arg1+arg2+b", ['b'], [b]);
    should.exist(fn, "fn");
    fn.should.have.property('name', 'myFn');
    fn.should.have.length(2);
    fn(10, 2).should.be.equal(135);
  });
  it("should create an async function via string with args and body new line", function () {
    var fn;
    fn = createFunction("async function myFn (arg1, arg2, arg3) \n {\nreturn a\n}\n");
    should.exist(fn, "fn");
    assert.isFunction(fn);
    assert.isTrue(fn.constructor.name === 'AsyncFunction');
    fn.should.have.property('name', 'myFn');
    fn.should.have.length(3);
  });

  it("should create an async function via name", function () {
    var fn;
    fn = createFunction("async sleep", ['ms'], "return new Promise(resolve => setTimeout(resolve, ms))");
    should.exist(fn, "fn");
    assert.isFunction(fn);
    assert.isTrue(fn.constructor.name === 'AsyncFunction');
    fn.should.have.property('name', 'sleep');
    fn.should.have.length(1);
    fn = createFunction("async empty");
    should.exist(fn, "fn");
    assert.isFunction(fn);
    assert.isTrue(fn.constructor.name === 'AsyncFunction');
    fn.should.have.property('name', 'empty');
    fn.should.have.length(0);
  });
});
