import sinonChai from "sinon-chai";
import sinon from "sinon";
import chai from "chai";
var assert = chai.assert;
var should = chai.should();
chai.use(sinonChai);

import getNames from '../../src/get-non-enumerable-names.js';
import defineProperty from '../../src/defineProperty.js';

describe("get-non-enumerable-names", function () {
  it("should get non-enumerable names", function () {
    var result, test;
    test = {
      hi: 12,
      thay: "asf"
    };
    defineProperty(test, 'non1', 1);
    defineProperty(test, 'non2', 2);
    result = getNames(test);
    result.should.be.deep.equal(['non1', 'non2']);
  });
  it("should get non-enumerable names with empty object", function () {
    var result, test;
    test = {};
    result = getNames(test);
    result.should.be.deep.equal([]);
  });
  it("should get non-enumerable names with inherits object", function () {
    class Root {
      ro1 = 12;
    }
    class Test extends Root {
      constructor() {
        super()
        defineProperty(this, 'non2', 1);
      }
    }
    defineProperty(Root.prototype, 'root_non1', 2);
    defineProperty(Test.prototype, 'non1', 1);
    var test = new Test();
    const result = getNames(test);
    result.should.be.deep.equal(['non2']);
  });
});
