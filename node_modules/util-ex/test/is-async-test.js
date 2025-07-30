import sinonChai from "sinon-chai";
import sinon from "sinon";
import chai from "chai";
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();
chai.use(sinonChai);

import {isAsync} from '../src/is/type/async.js';

describe('isAsync', () => {
  it('should return true for a Promise', () => {
    expect(isAsync(Promise.resolve())).to.be.true;
  });

  it('should return true for an async function', () => {
    const asyncFunc = async () => {};
    expect(isAsync(asyncFunc)).to.be.true;
  });

  it('should return true for an async generator', () => {
    const asyncGen = async function* () {};
    expect(isAsync(asyncGen)).to.be.true;
  });

  it('should return false for a regular function', () => {
    const regularFunc = () => {};
    expect(isAsync(regularFunc)).to.be.false;
  });

  it('should return false for an object', () => {
    expect(isAsync({})).to.be.false;
  });

  it('should return false for a string', () => {
    expect(isAsync('string')).to.be.false;
  });

  it('should return false for a number', () => {
    expect(isAsync(123)).to.be.false;
  });

  it('should return false for null', () => {
    expect(isAsync(null)).to.be.false;
  });

  it('should return false for undefined', () => {
    expect(isAsync(undefined)).to.be.false;
  });
});
