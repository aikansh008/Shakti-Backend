import sinonChai from "sinon-chai";
import sinon from "sinon";
import chai from "chai";
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();
chai.use(sinonChai);

import {isAsyncIterable} from '../src/is/type/async-iterable.js';

describe("is/type/async-iterable", function () {

  it('should return true for an async iterable object', () => {
    const asyncIterable = {
      [Symbol.asyncIterator]: async function*() {
        yield 1;
        yield 2;
        yield 3;
      }
    };
    expect(isAsyncIterable(asyncIterable)).to.be.true;
  });

  it('should return false for a non-async iterable object', () => {
    const nonAsyncIterable = { };
    expect(isAsyncIterable(nonAsyncIterable)).to.be.false;
  });

  it('should return false for null', () => {
    expect(isAsyncIterable(null)).to.be.false;
  });

  it('should return false for undefined', () => {
    expect(isAsyncIterable(undefined)).to.be.false;
  });

  it('should return false for other types of values', () => {
    expect(isAsyncIterable(123)).to.be.false;
    expect(isAsyncIterable('abc')).to.be.false;
    expect(isAsyncIterable(true)).to.be.false;
    expect(isAsyncIterable(() => {})).to.be.false;
    expect(isAsyncIterable([1,2])).to.be.false;
  });

  it('returns false for objects with Symbol.iterator property of non-function type', () => {
    const obj = {
      [Symbol.asyncIterator]: 123
    };
    expect(isAsyncIterable(obj)).to.be.false
  });

});
