import sinonChai from "sinon-chai";
import chai from "chai";
var assert = chai.assert;
chai.use(sinonChai);
import isPlainObject from '../src/is/type/plain-object.js';

describe('isPlainObject Tests', function() {
  it('should return `true` if the object is created by the `Object` constructor.', function() {
    assert(isPlainObject(Object.create({})));
    assert(isPlainObject(Object.create(Object.prototype)));
    assert(isPlainObject({foo: 'bar'}));
    assert(isPlainObject({}));
    assert(isPlainObject(Object.create(null)));
  });

  it('should return `false` if the object is not created by the `Object` constructor.', function() {
    function Foo() {this.abc = {};};

    assert(!isPlainObject(/foo/));
    assert(!isPlainObject(function() {}));
    assert(!isPlainObject(1));
    assert(!isPlainObject(['foo', 'bar']));
    assert(!isPlainObject([]));
    assert(!isPlainObject(new Foo));
    assert(!isPlainObject(null));
  });
});
