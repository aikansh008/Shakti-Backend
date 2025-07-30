import sinonChai from "sinon-chai";
import sinon from "sinon";
import chai from "chai";
var assert = chai.assert;
var should = chai.should();
chai.use(sinonChai);

import injectMethod from '../src/injectMethod.js';

describe("injectMethod", function () {
  it("should inject method to an object", function () {
    var newExec, newRun, orgExec, orgRun, t;
    orgExec = sinon.spy(function () {
      this.should.be.equal(t);
    });
    orgRun = sinon.spy(function () {
      this.should.be.equal(t);
    });
    class Test {}
    ;
    Test.prototype.exec = orgExec;
    Test.prototype.run = orgRun;
    newExec = sinon.spy(function (a, b) {
      this.super("hi", 1);
      this.self.should.be.equal(t);
    });
    newRun = sinon.spy(function (a, b) {
      this.super("my", 2);
      this.self.should.be.equal(t);
    });
    injectMethod(Test.prototype, 'exec', newExec).should.be.true;
    t = new Test();
    t.exec(1, 2);
    orgExec.should.have.been.calledOnce;
    orgExec.should.have.been.calledWith('hi', 1);
    newExec.should.have.been.calledOnce;
    newExec.should.have.been.calledWith(1, 2);
  });
  it("should inject new method to an object", function () {
    var Test, newExec, newRun, t;
    Test = class Test {};
    newExec = sinon.spy(function (a, b) {
      should.not.exist(this.super);
      return this.should.be.equal(t);
    });
    newRun = sinon.spy(function (a, b) {
      should.not.exist(this.super);
      return this.should.be.equal(t);
    });
    injectMethod(Test.prototype, 'exec', newExec).should.be.true;
    Test.prototype.exec.should.be.equal(newExec);
    t = new Test();
    t.exec(1, 2);
    newExec.should.have.been.calledOnce;
    return newExec.should.have.been.calledWith(1, 2);
  });
  it("should inject (class) method to an object", function () {
    var newExec, newRun, orgExec, orgRun;
    orgExec = sinon.spy();
    orgRun = sinon.spy();
    class Test {}
    ;
    Test.exec = orgExec;
    Test.run = orgRun;
    newExec = sinon.spy(function (a, b) {
      return this.super("hi", 1);
    });
    newRun = sinon.spy(function (a, b) {
      return this.super("my", 2);
    });
    injectMethod(Test, 'exec', newExec).should.be.true;
    Test.exec(1, 2);
    orgExec.should.have.been.calledOnce;
    orgExec.should.have.been.calledWith('hi', 1);
    newExec.should.have.been.calledOnce;
    newExec.should.have.been.calledWith(1, 2);
  });
  it("should not inject method to a non-function attribute of an object", function () {
    var newExec;
    class Test {}
    ;
    Test.prototype.exec = 123;
    newExec = sinon.spy(function (a, b) {
      should.not.exist(this.super);
      this.should.be.equal(t);
    });
    injectMethod(Test.prototype, 'exec', newExec).should.be.false;
    Test.prototype.exec.should.be.equal(123);
  });
  it("should inject old method to an object", function () {
    let t
    function Test() {
      t = this
      this.initialize.apply(this, arguments);
    }
    const orgExec = sinon.spy(function () {
      should.exist(this);
      this.should.be.equal(t);
    });
    Test.prototype.initialize = orgExec
    const newExec = sinon.spy(function () {
      should.exist(this.super);
      should.exist(this.self);
      should.exist(this.initialize);
      this.self.should.be.equal(t);
      this.super.call(null, 1, 2);
      this.initialize.call(this.self, 6, 6);
    });
    injectMethod(Test.prototype, 'initialize', newExec).should.be.true;
    t = new Test(4,5)
    newExec.should.have.been.calledOnce;
    newExec.should.have.been.calledWith(4, 5);
    orgExec.should.have.been.calledTwice;
    orgExec.should.have.been.calledWith(1, 2);
    orgExec.should.have.been.calledWith(6, 6);
  });

});
