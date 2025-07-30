import { toRegExp } from '../src/to-regexp.js';

describe("toRegExp", function () {
  it("should create RegExp object from regexp string", function () {
    let regexp = toRegExp('/[a-z]/');
    regexp.should.be.an.instanceof(RegExp);
    regexp.source.should.be.equal('[a-z]');
    regexp.flags.should.be.equal('');
    regexp = toRegExp('/[a-z]/gi');
    regexp.should.be.an.instanceof(RegExp);
    regexp.source.should.be.equal('[a-z]');
    regexp.flags.should.be.equal('gi');
  });

  it("should clone RegExp object from regexp object", function () {
    let expected = /[a-z]/;
    let regexp = toRegExp(expected);
    regexp.should.be.an.instanceof(RegExp);
    regexp.should.not.be.equal(expected);
    regexp.source.should.be.equal(expected.source);
    regexp.flags.should.be.equal(expected.flags);

    expected = /[a-z]/ig;
    regexp = toRegExp(expected);
    regexp.should.be.an.instanceof(RegExp);
    regexp.should.not.be.equal(expected);
    regexp.source.should.be.equal(expected.source);
    regexp.flags.should.be.equal(expected.flags);
  });
});
