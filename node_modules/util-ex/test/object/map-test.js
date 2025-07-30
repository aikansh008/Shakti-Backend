import sinonChai from "sinon-chai";
import sinon from "sinon";
import chai from "chai";
var assert = chai.assert;
var should = chai.should();
chai.use(sinonChai);

import defineProperty from '../../src/defineProperty.js';
import map from '../../src/object/map.js';

describe('object/map', function () {
  it('should map an object values to an array', function () {
    var result;
    result = map({
      a: 23,
      b: 34,
      c: 'dfg'
    });
    result.should.be.deep.equal([23, 34, 'dfg']);
  });
  it('should map an object all(includes non-enumerable) values to an array', function () {
    var obj, result;
    obj = {
      a: 23,
      b: 34
    };
    defineProperty(obj, 'nonEnum', 'hi');
    result = map(obj, {
      nonEnumerable: true
    });
    result.should.be.deep.equal([23, 34, 'hi']);
  });
  it('should map an object non-enumerable values to an array', function () {
    var obj, result;
    obj = {
      a: 23,
      b: 34
    };
    defineProperty(obj, 'nonEnum', 'hi');
    result = map(obj, {
      nonEnumerable: true,
      enumerable: false
    });
    result.should.be.deep.equal(['hi']);
  });
});
