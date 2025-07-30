import sinonChai from "sinon-chai";
import sinon from "sinon";
import chai from "chai";
var assert = chai.assert;
var should = chai.should();
chai.use(sinonChai);

import isIn from '../src/is/in.js';

describe('is/in', function () {
  it('should test a case-sensitive string whether in a list', function () {
    assert.ok(isIn('1ad', ['k2d8', '1ad'], true));
    return assert.notOk(isIn('1Ad', ['k2d8', '1ad'], true));
  });
  it('should test a string whether in a list', function () {
    assert.ok(isIn('1ad', ['1ad']));
    assert.ok(isIn('1Ad', ['k2d8', '1ad']));
    assert.ok(isIn('3df', ['1ad', '3df']));
    assert.notOk(isIn('3af', ['1ad', '3df']));
    assert.notOk(isIn('3af', []));
    return assert.notOk(isIn('', ['sss']));
  });
  it('should test a string whether in a list with RegExp', function () {
    assert.ok(isIn('1ab', ['1ad', /\d+/]));
    assert.ok(isIn('Summary', [/Summary/]));
    assert.ok(isIn('summary', [/Summary/]));
    assert.ok(isIn('1234s', ['1ad', /\d+/]));
    return assert.notOk(isIn('12343d', ['1ad', /^\d+$/]));
  });
  return it('should test a case-sensitive string whether in a list with RegExp', function () {
    assert.ok(isIn('1ab', ['1ad', /1ab/], true));
    return assert.notOk(isIn('1Ab', [/1ab/], true));
  });
});
