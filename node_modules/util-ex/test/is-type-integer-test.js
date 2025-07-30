import sinonChai from "sinon-chai";
import sinon from "sinon";
import chai from "chai";
var assert = chai.assert;
var should = chai.should();
chai.use(sinonChai);

import isInt from '../src/is/type/integer.js';

describe("is/type/integer", function () {
  it("should test value whether integer", function () {
    assert.equal(isInt(12883), true);
    assert.equal(isInt(0), true);
    assert.equal(isInt(0x12883), true);
    assert.equal(isInt("12883"), false);
    assert.equal(isInt(128e-10), false);
    return assert.equal(isInt(128.83), false);
  });
});
