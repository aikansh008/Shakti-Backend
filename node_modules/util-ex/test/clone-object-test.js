import sinonChai from "sinon-chai";
import sinon from "sinon";
import chai from "chai";
var assert = chai.assert;
var should = chai.should();
chai.use(sinonChai);

import cloneObject from '../src/clone-object.js';

describe("cloneObject", function () {
  it("should clone a plain object", function () {
    var result, test;
    test = {
      hi: 12,
      thay: "asf",
      ah: [1, 2, 3]
    };
    result = cloneObject(test);
    result.should.be.deep.equal(test);
    return result.should.not.be.equal(test);
  });
  it("should clone an array", function () {
    var result, test;
    test = [4, 129, 3, 28834];
    result = cloneObject(test);
    result.should.be.deep.equal(test);
    result.should.be.instanceof(Array);
    Array.isArray(result).should.be.true;
    return result.should.not.be.equal(test);
  });
  it("should clone a class instance", function () {
    var Abc, obj, result;
    Abc = function () {
      class Abc {
        constructor(hi, world) {
          this.hi = hi;
          this.world = world;
        }
      }
      ;
      Abc.prototype.a = 'cc';
      return Abc;
    }.call(this);
    obj = new Abc('ho', 1394);
    result = cloneObject(obj);
    result.should.be.instanceof(Abc);
    result.should.be.deep.equal(obj);
    return result.should.not.be.equal(obj);
  });
  it("should clone a class instance via clone method", function () {
    var Abc, obj, result;
    Abc = function () {
      class Abc {
        clone() {
          return new Abc(1, 2);
        }
        constructor(hi, world) {
          this.hi = hi;
          this.world = world;
        }
      }
      ;
      Abc.prototype.a = 'cc';
      return Abc;
    }.call(this);
    obj = new Abc('ho', 1394);
    result = cloneObject(obj);
    result.should.be.instanceof(Abc);
    result.should.be.deep.equal(new Abc(1, 2));
  });
  it("should clone a class instance via disable clone method", function () {
    var Abc, obj, result;
    Abc = function () {
      class Abc {
        clone() {
          return new Abc(1, 2);
        }
        constructor(hi, world) {
          this.hi = hi;
          this.world = world;
        }
      }
      ;
      Abc.prototype.a = 'cc';
      return Abc;
    }.call(this);
    obj = new Abc('ho', 1394);
    result = cloneObject(obj, false);
    result.should.be.instanceof(Abc);
    result.should.be.deep.equal(obj);
    result.should.not.be.equal(obj);
  });
});
