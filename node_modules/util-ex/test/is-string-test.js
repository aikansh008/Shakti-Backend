import sinonChai from "sinon-chai";
import sinon from "sinon";
import chai from "chai";
var assert = chai.assert;
var should = chai.should();
chai.use(sinonChai);

import isJson from '../src/is/string/json.js';
import isInt from '../src/is/string/int.js';
import isFunctionStr from '../src/is/string/function.js';
import isRegExpStr from '../src/is/string/regexp.js';

describe("is/string/int", function () {
  it("should test string whether integer", function () {
    assert.equal(isInt("12883"), true);
    assert.equal(isInt("012883"), true);
    assert.equal(isInt("0x12883"), true);
    assert.equal(isInt("128.83"), false);
    assert.equal(isInt("128e83"), false);
  });
});
describe("is/string/json", function () {
  it("should test string integer whether json", function () {
    assert.equal(isJson("12883"), true);
    assert.equal(isJson("012883"), true);
    assert.equal(isJson("0x12883"), false);
    assert.equal(isJson("128.83"), true);
    assert.equal(isJson("128e83"), true);
  });
  it("should test string whether json", function () {
    assert.equal(isJson("'12883'"), false);
    assert.equal(isJson('"012883"'), true);
    return assert.equal(isJson("'0x12883\""), false);
  });
  it("should test string object whether json", function () {
    assert.equal(isJson('{"a":12883}'), true);
    assert.equal(isJson("{a:12883}"), false);
    return assert.equal(isJson("{a:12883,b}", true), true); //almost json = true
  });

  return it("should test string array whether json", function () {
    assert.equal(isJson('["a", 12883]'), true);
    assert.equal(isJson('["a", 12883'), false);
    assert.equal(isJson('["a, 12883]'), false);
    return assert.equal(isJson('["a, 12883]', true), true);
  });
});
describe("is/string/function", function () {
  it("should test anonymous function string", function () {
    isFunctionStr('function(){}').should.be.true;
    isFunctionStr('function() \t {\t;}\t').should.be.true;
    isFunctionStr(';function(a,b){}').should.be.true;
    isFunctionStr('a;function(a,b){}').should.be.false;
  });
  it("should test function string", function () {
    isFunctionStr('function abs(){}').should.be.true;
    isFunctionStr('functionabs(){}').should.be.false;
  });
});

describe("is/string/regexp", function () {
  it("should test regexp string", function () {
    isRegExpStr('/[a-z]/').should.be.true;
    isRegExpStr('/[a-z]/g').should.be.true;
    isRegExpStr('/[a-z]/gi').should.be.true;
    isRegExpStr('function abs(/[a-z]/){}').should.be.false;
    isRegExpStr('/test').should.be.false;
    isRegExpStr('//').should.be.false;
  });
});
