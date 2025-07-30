import sinonChai from "sinon-chai";
import sinon from "sinon";
import chai from "chai";
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();
chai.use(sinonChai);

import {isIterable} from '../src/is/type/iterable.js';

describe("is/type/iterable", function () {

  it('returns true for iterable objects', () => {
    const iterable = [1, 2, 3];
    expect(isIterable(iterable)).to.be.true;
  });

  it('returns false for non-iterable objects', () => {
    const nonIterable = { 0: 'a', 1: 'b', 2: 'c' };
    expect(isIterable(nonIterable)).to.be.false;
  });

  it('returns false for non-objects', () => {
    expect(isIterable(123)).to.be.false;
    expect(isIterable(Boolean(1))).to.be.false;
    expect(isIterable(null)).to.be.false;
    expect(isIterable(undefined)).to.be.false;
  });

  it('returns false for objects without Symbol.iterator property', () => {
    const obj = {};
    expect(isIterable(obj)).to.be.false
  });

  it('returns false for objects with Symbol.iterator property of non-function type', () => {
    const obj = {
      [Symbol.iterator]: 123
    };
    expect(isIterable(obj)).to.be.false
  });

});
