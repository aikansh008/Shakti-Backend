import sinonChai from "sinon-chai";
import sinon from "sinon";
import chai from "chai";
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();
chai.use(sinonChai);

import path from "../src/";

const isWindows = process.platform === 'win32';

describe("nodejs path module", function() {
  it("should have win32 and posix object", function() {
    assert.equal(path.win32.sep, '\\');
    assert.equal(path.posix.sep, '/');
    assert.equal(path.win32.delimiter, ';');
    assert.equal(path.posix.delimiter, ':');
    if (isWindows) {
      assert.deepEqual(path, path.win32, 'should be win32 path module');
    } else {
      assert.deepEqual(path, path.posix, 'should be posix path module');
    }
  });
});
