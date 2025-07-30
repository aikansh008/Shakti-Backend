import sinonChai from "sinon-chai";
import sinon from "sinon";
import chai from "chai";
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();
chai.use(sinonChai);

import escapeStringRegexp from "../src/escapeStringRegexp";

describe("escapeStringRegexp", function() {
  it("should escape special characters", function() {
    assert.equal(escapeStringRegexp("a+b"), "a\\+b");
    assert.equal(escapeStringRegexp("a*b"), "a\\*b");
    assert.equal(escapeStringRegexp("a?b"), "a\\?b");
    assert.equal(escapeStringRegexp("a.b"), "a\\.b");
    assert.equal(escapeStringRegexp("a$b"), "a\\$b");
    assert.equal(escapeStringRegexp('\\ ^ $ * + ? . ( ) | { } [ ]'), '\\\\ \\^ \\$ \\* \\+ \\? \\. \\( \\) \\| \\{ \\} \\[ \\]')
  })

  it('throws a TypeError if the input is not a string', () => {
    expect(() => escapeStringRegexp(123)).to.throw(TypeError, 'Expected a string');
  });

  it('escapes special characters correctly', () => {
    const input = 'Hello, world! (It\'s me.)';
    const expectedOutput = 'Hello,\ world!\ \\(It\'s\ me\\.\\)';
    const actualOutput = escapeStringRegexp(input);

    expect(actualOutput).to.equal(expectedOutput);
  });

  it('escapes the hyphen (-) correctly', () => {
    const input = 'a-b';
    const expectedOutput = 'a\\x2db';
    const actualOutput = escapeStringRegexp(input);

    expect(actualOutput).to.equal(expectedOutput);
    expect(escapeStringRegexp('foo - bar')).to.equal('foo \\x2d bar')
  });

  it('escapes `-` in a way compatible with the Unicode flag', () => {
    expect(new RegExp(escapeStringRegexp('-'), 'u').test('-')).to.equal(true);
  })
});
