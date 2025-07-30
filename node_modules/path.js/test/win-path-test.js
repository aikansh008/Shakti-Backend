import sinonChai from "sinon-chai";
import sinon from "sinon";
import chai from "chai";
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();
chai.use(sinonChai);

import {WinPath} from "../src/win"

const path = new WinPath

const commonTests = [[['.', 'x', 'b', '..', 'b', 'c.js'], 'x/b/c.js'], [['/.', 'x', 'b', '..', 'b', 'c.js'], '/x/b/c.js'], [['/foo', '../../../bar'], '/bar'], [['.', 'foo', '../../../bar'], '../../bar'], [['.', 'foo/', '../../../bar'], '../../bar'], [['.', 'foo/x', '../../../bar'], '../bar'], [['foo/x', './bar'], 'foo/x/bar'], [['foo/x/', './bar'], 'foo/x/bar'], [['foo/x/', '.', 'bar'], 'foo/x/bar'], [['.', '.', '.'], '.'], [['.', './', '.'], '.'], [['.'], '.'], [['', '.'], '.'], [['', 'foo'], 'foo'], [['', '/foo'], '/foo'], [['', '', '/foo'], '/foo'], [['', '', 'foo'], 'foo'], [['foo', ''], 'foo'], [['/'], '/'], [['/', '.'], '/'], [['/', '..'], '/'], [['/', '..', '..'], '/'], [[''], '.'], [['', ''], '.'], [[' /foo'], ' /foo'], [[' ', 'foo'], ' /foo'], [[' ', '.'], ' '], [[' ', ''], ' '], [['/', 'foo'], '/foo'], [['/', '/foo'], '/foo'], [['/', '//foo'], '/foo'], [['/', '', '/foo'], '/foo'], [['', '/', 'foo'], '/foo'], [['', '/', '/foo'], '/foo']];

const joinTests = commonTests.slice();

joinTests.push([['//foo/bar'], '//foo/bar/'], [['\\/foo/bar'], '//foo/bar/'], [['\\\\foo/bar'], '//foo/bar/'], [['//foo', 'bar'], '//foo/bar/'], [['//foo/', 'bar'], '//foo/bar/'], [['//foo', '/bar'], '//foo/bar/'], [['//foo', '', 'bar'], '//foo/bar/'], [['//foo/', '', 'bar'], '//foo/bar/'], [['//foo/', '', '/bar'], '//foo/bar/'], [['', '//foo', 'bar'], '//foo/bar/'], [['', '//foo/', 'bar'], '//foo/bar/'], [['', '//foo/', '/bar'], '//foo/bar/'], [['\\', 'foo/bar'], '/foo/bar'], [['\\', '/foo/bar'], '/foo/bar'], [['', '/', '/foo/bar'], '/foo/bar'], [['//', 'foo/bar'], '/foo/bar'], [['//', '/foo/bar'], '/foo/bar'], [['\\\\', '/', '/foo/bar'], '/foo/bar'], [['//'], '/'], [['//foo'], '/foo'], [['//foo/'], '/foo/'], [['//foo', '/'], '/foo/'], [['//foo', '', '/'], '/foo/'], [['///foo/bar'], '/foo/bar'], [['////foo', 'bar'], '/foo/bar'], [['\\\\\\/foo/bar'], '/foo/bar'], [['c:'], 'c:.'], [['c:.'], 'c:.'], [['c:', ''], 'c:.'], [['', 'c:'], 'c:.'], [['c:.', '/'], 'c:./'], [['c:.', 'file'], 'c:file'], [['c:', '/'], 'c:/'], [['c:', 'file'], 'c:/file']);

const resolveTests = [[['c:/blah\\blah', 'd:/games', 'c:../a'], 'c:\\blah\\a'], [['c:/ignore', 'd:\\a/b\\c/d', '\\e.exe'], 'd:\\e.exe'], [['c:/ignore', 'c:/some/file'], 'c:\\some\\file'], [['d:/ignore', 'd:some/dir//'], 'd:\\ignore\\some\\dir'], [['.'], path.cwd()], [['//server/share', '..', 'relative\\'], '\\\\server\\share\\relative'], [['c:/', '//'], 'c:\\'], [['c:/', '//dir'], 'c:\\dir'], [['c:/', '//server/share'], '\\\\server\\share\\'], [['c:/', '//server//share'], '\\\\server\\share\\'], [['c:/', '///some//dir'], 'c:\\some\\dir']];

const relativeTests = [['c:/blah\\blah', 'd:/games', 'd:\\games'], ['c:/aaaa/bbbb', 'c:/aaaa', '..'], ['c:/aaaa/bbbb', 'c:/cccc', '..\\..\\cccc'], ['c:/aaaa/bbbb', 'c:/aaaa/bbbb', ''], ['c:/aaaa/bbbb', 'c:/aaaa/cccc', '..\\cccc'], ['c:/aaaa/', 'c:/aaaa/cccc', 'cccc'], ['c:/', 'c:\\aaaa\\bbbb', 'aaaa\\bbbb'], ['c:/aaaa/bbbb', 'd:\\', 'd:\\']];

describe("win path functions", function() {
  it("should detect default configs", function() {
    path.sep.should.be.equal('\\');
    path.delimiter.should.be.equal(';');
  });
  describe("trimArray", function() {
    it("should trim array from left", function() {
      var result;
      result = path.trimArray(['', '', false, void 0, '123', 'abc']);
      result.should.be.deep.equal(['123', 'abc']);
    });
    it("should trim array from right", function() {
      var result;
      result = path.trimArray(['123', 'abc', '', '', false, void 0]);
      result.should.be.deep.equal(['123', 'abc']);
    });
    it("should trim array from left and right direction", function() {
      var result;
      result = path.trimArray(['', '', false, void 0, '123', 'abc', '', '', false, void 0]);
      result.should.be.deep.equal(['123', 'abc']);
    });
    it("should trim a trimed array", function() {
      var result;
      result = path.trimArray(['123', 'abc']);
      result.should.be.deep.equal(['123', 'abc']);
    });
    it("should trim empty array ", function() {
      var result;
      result = path.trimArray(['', '', false, void 0, null]);
      result.should.be.deep.equal([]);
    });
  });
  describe("splitPath", function() {
    it('should split absoluted file path', function() {
      var result;
      result = path.splitPath('/sdsd/asas/sdd.com');
      result.should.be.deep.equal(['/', 'sdsd/asas/', 'sdd.com', '.com']);
    });
    it('should split related file path', function() {
      var result;
      result = path.splitPath('sdsd/asas/sdd.com');
      result.should.be.deep.equal(['', 'sdsd/asas/', 'sdd.com', '.com']);
    });
    it('should split absoluted path', function() {
      var result;
      result = path.splitPath('/sdsd/asas/sdd');
      result.should.be.deep.equal(['/', 'sdsd/asas/', 'sdd', '']);
    });
    it('should split related path', function() {
      var result;
      result = path.splitPath('sdsd/asas/sdd');
      result.should.be.deep.equal(['', 'sdsd/asas/', 'sdd', '']);
    });
  });
  describe("normalizeArray", function() {
    it('should normalize array', function() {
      assert.deepEqual(path.normalizeArray(['.', 'fixtures', 'b1', '..', 'b', 'c.js']), ['fixtures', 'b', 'c.js']);
      assert.deepEqual(path.normalizeArray(['\\', 'foo', '..', '..', '..', 'bar']), ['bar']);
      assert.deepEqual(path.normalizeArray(['a', 'b1', '..', 'b']), ['a', 'b']);
      assert.deepEqual(path.normalizeArray(['a', 'b', '.', 'c']), ['a', 'b', 'c']);
      assert.deepEqual(path.normalizeArray(['a', 'b', '.']), ['a', 'b']);
    });
  });
  describe("normalize", function() {
    it('should normalize path', function() {
      assert.equal(path.normalize('./fixtures///b/../b/c.js'), 'fixtures\\b\\c.js');
      assert.equal(path.normalize('/foo/../../../bar'), '\\bar');
      assert.equal(path.normalize('a//b//../b'), 'a\\b');
      assert.equal(path.normalize('a//b//./c'), 'a\\b\\c');
      assert.equal(path.normalize('a//b//.'), 'a\\b');
      assert.equal(path.normalize('//server/share/dir/file.ext'), '\\\\server\\share\\dir\\file.ext');
    });
  });
  describe("resolve", function() {
    it('should resolve path', function() {
      resolveTests.forEach(function(test) {
        var actual, expected;
        actual = path.resolve.apply(path, test[0]);
        expected = test[1];
        actual.should.be.deep.equal(expected);
      });
    });
  });
  describe("join", function() {
    it('should join path', function() {
      joinTests.forEach(function(test) {
        var actual, expected;
        actual = path.join.apply(path, test[0]);
        expected = test[1].replace(/\//g, '\\');
        actual.should.be.deep.equal(expected);
      });
    });
  });
  describe("relative", function() {
    it('should relative from path to path', function() {
      relativeTests.forEach(function(test) {
        var actual, expected;
        actual = path.relative(test[0], test[1]);
        expected = test[2];
        actual.should.be.deep.equal(expected);
      });
    });
  });
  describe("basename", function() {
    it('should get basename from path', function() {
      var f;
      f = __filename;
      assert.equal(path.basename(f), 'win-path-test.js');
      assert.equal(path.basename(f, '.js'), 'win-path-test');
      assert.equal(path.basename(''), '');
      assert.equal(path.basename('/dir/basename.ext'), 'basename.ext');
      assert.equal(path.basename('/basename.ext'), 'basename.ext');
      assert.equal(path.basename('basename.ext'), 'basename.ext');
      assert.equal(path.basename('basename.ext/'), 'basename.ext');
      assert.equal(path.basename('basename.ext//'), 'basename.ext');
      assert.equal(path.basename('\\dir\\basename.ext'), 'basename.ext');
      assert.equal(path.basename('\\basename.ext'), 'basename.ext');
      assert.equal(path.basename('basename.ext'), 'basename.ext');
      assert.equal(path.basename('basename.ext\\'), 'basename.ext');
      assert.equal(path.basename('basename.ext\\\\'), 'basename.ext');
    });
  });
  describe("dirname", function() {
    it('should get dirname from path', function() {
      var f;
      f = __filename;
      assert.equal(path.dirname(f).substr(-4), 'test');
      assert.equal(path.dirname('/a/b/'), '/a');
      assert.equal(path.dirname('/a/b'), '/a');
      assert.equal(path.dirname('/a'), '/');
      assert.equal(path.dirname(''), '.');
      assert.equal(path.dirname('/'), '/');
      assert.equal(path.dirname('////'), '/');
      assert.equal(path.dirname('c:\\'), 'c:\\');
      assert.equal(path.dirname('c:\\foo'), 'c:\\');
      assert.equal(path.dirname('c:\\foo\\'), 'c:\\');
      assert.equal(path.dirname('c:\\foo\\bar'), 'c:\\foo');
      assert.equal(path.dirname('c:\\foo\\bar\\'), 'c:\\foo');
      assert.equal(path.dirname('c:\\foo\\bar\\baz'), 'c:\\foo\\bar');
      assert.equal(path.dirname('\\'), '\\');
      assert.equal(path.dirname('\\foo'), '\\');
      assert.equal(path.dirname('\\foo\\'), '\\');
      assert.equal(path.dirname('\\foo\\bar'), '\\foo');
      assert.equal(path.dirname('\\foo\\bar\\'), '\\foo');
      assert.equal(path.dirname('\\foo\\bar\\baz'), '\\foo\\bar');
      assert.equal(path.dirname('c:'), 'c:');
      assert.equal(path.dirname('c:foo'), 'c:');
      assert.equal(path.dirname('c:foo\\'), 'c:');
      assert.equal(path.dirname('c:foo\\bar'), 'c:foo');
      assert.equal(path.dirname('c:foo\\bar\\'), 'c:foo');
      assert.equal(path.dirname('c:foo\\bar\\baz'), 'c:foo\\bar');
      assert.equal(path.dirname('\\\\unc\\share'), '\\\\unc\\share');
      assert.equal(path.dirname('\\\\unc\\share\\foo'), '\\\\unc\\share\\');
      assert.equal(path.dirname('\\\\unc\\share\\foo\\'), '\\\\unc\\share\\');
      assert.equal(path.dirname('\\\\unc\\share\\foo\\bar'), '\\\\unc\\share\\foo');
      assert.equal(path.dirname('\\\\unc\\share\\foo\\bar\\'), '\\\\unc\\share\\foo');
      assert.equal(path.dirname('\\\\unc\\share\\foo\\bar\\baz'), '\\\\unc\\share\\foo\\bar');
    });
  });
  describe("extname", function() {
    it('should get ext name from path', function() {
      var f;
      f = __filename;
      assert.equal(path.extname(f), '.js');
      assert.equal(path.extname(''), '');
      assert.equal(path.extname('/path/to/file'), '');
      assert.equal(path.extname('/path/to/file.ext'), '.ext');
      assert.equal(path.extname('/path.to/file.ext'), '.ext');
      assert.equal(path.extname('/path.to/file'), '');
      assert.equal(path.extname('/path.to/.file'), '');
      assert.equal(path.extname('/path.to/.file.ext'), '.ext');
      assert.equal(path.extname('/path/to/f.ext'), '.ext');
      assert.equal(path.extname('/path/to/..ext'), '.ext');
      assert.equal(path.extname('file'), '');
      assert.equal(path.extname('file.ext'), '.ext');
      assert.equal(path.extname('.file'), '');
      assert.equal(path.extname('.file.ext'), '.ext');
      assert.equal(path.extname('/file'), '');
      assert.equal(path.extname('/file.ext'), '.ext');
      assert.equal(path.extname('/.file'), '');
      assert.equal(path.extname('/.file.ext'), '.ext');
      assert.equal(path.extname('.path/file.ext'), '.ext');
      assert.equal(path.extname('file.ext.ext'), '.ext');
      assert.equal(path.extname('file.'), '.');
      assert.equal(path.extname('.'), '');
      assert.equal(path.extname('./'), '');
      assert.equal(path.extname('.file.ext'), '.ext');
      assert.equal(path.extname('.file'), '');
      assert.equal(path.extname('.file.'), '.');
      assert.equal(path.extname('.file..'), '.');
      assert.equal(path.extname('..'), '');
      assert.equal(path.extname('../'), '');
      assert.equal(path.extname('..file.ext'), '.ext');
      assert.equal(path.extname('..file'), '.file');
      assert.equal(path.extname('..file.'), '.');
      assert.equal(path.extname('..file..'), '.');
      assert.equal(path.extname('...'), '.');
      assert.equal(path.extname('...ext'), '.ext');
      assert.equal(path.extname('....'), '.');
      assert.equal(path.extname('file.ext/'), '.ext');
      assert.equal(path.extname('file.ext//'), '.ext');
      assert.equal(path.extname('file/'), '');
      assert.equal(path.extname('file//'), '');
      assert.equal(path.extname('file./'), '.');
      assert.equal(path.extname('file.//'), '.');
      assert.equal(path.extname('.\\'), '');
      assert.equal(path.extname('..\\'), '');
      assert.equal(path.extname('file.ext\\'), '.ext');
      assert.equal(path.extname('file.ext\\\\'), '.ext');
      assert.equal(path.extname('file\\'), '');
      assert.equal(path.extname('file\\\\'), '');
      assert.equal(path.extname('file.\\'), '.');
      assert.equal(path.extname('file.\\\\'), '.');
    });
  });
  describe("_makeLong", function() {
    it('should _makeLong from path', function() {
      assert.equal(path._makeLong(null), null);
      assert.equal(path._makeLong(100), 100);
      assert.equal(path._makeLong(path), path);
      assert.equal(path._makeLong(false), false);
      assert.equal(path._makeLong(true), true);
    });
  });
  describe("parse path format", function() {
    var checkErrors, checkFormat, checkParseFormat, errors, winPaths, winSpecialCaseFormatTests;
    winPaths = ['C:\\path\\dir\\index.html', 'C:\\another_path\\DIR\\1\\2\\33\\index', 'another_path\\DIR with spaces\\1\\2\\33\\index', '\\foo\\C:', 'file', '.\\file', '\\\\server\\share\\file_path', '\\\\server two\\shared folder\\file path.zip', '\\\\teela\\admin$\\system32', '\\\\?\\UNC\\server\\share'];
    winSpecialCaseFormatTests = [
      [
        {
          dir: 'some\\dir'
        }, 'some\\dir\\'
      ], [
        {
          base: 'index.html'
        }, 'index.html'
      ], [{}, '']
    ];
    errors = [
      {
        method: 'parse',
        input: [null],
        message: /Parameter 'pathString' must be a string, not/
      }, {
        method: 'parse',
        input: [{}],
        message: /Parameter 'pathString' must be a string, not object/
      }, {
        method: 'parse',
        input: [true],
        message: /Parameter 'pathString' must be a string, not boolean/
      }, {
        method: 'parse',
        input: [1],
        message: /Parameter 'pathString' must be a string, not number/
      }, {
        method: 'parse',
        input: [],
        message: /Parameter 'pathString' must be a string, not undefined/
      }, {
        method: 'format',
        input: [null],
        message: /Parameter 'pathObject' must be an object, not/
      }, {
        method: 'format',
        input: [''],
        message: /Parameter 'pathObject' must be an object, not string/
      }, {
        method: 'format',
        input: [true],
        message: /Parameter 'pathObject' must be an object, not boolean/
      }, {
        method: 'format',
        input: [1],
        message: /Parameter 'pathObject' must be an object, not number/
      }, {
        method: 'format',
        input: [
          {
            root: true
          }
        ],
        message: /'pathObject.root' must be a string or undefined, not boolean/
      }, {
        method: 'format',
        input: [
          {
            root: 12
          }
        ],
        message: /'pathObject.root' must be a string or undefined, not number/
      }
    ];
    checkErrors = function(path) {
      errors.forEach(function(errorCase) {
        var err;
        try {
          path[errorCase.method].apply(path, errorCase.input);
        } catch (error) {
          err = error;
          assert.ok(err instanceof TypeError);
          assert.ok(errorCase.message.test(err.message), 'expected ' + errorCase.message + ' to match ' + err.message);
          return;
        }
        assert.fail('should have thrown');
      });
    };
    checkParseFormat = function(path, paths) {
      paths.forEach(function(element, index, array) {
        var output;
        output = path.parse(element);
        assert.strictEqual(path.format(output), element);
        assert.strictEqual(output.dir, output.dir ? path.dirname(element) : '');
        assert.strictEqual(output.base, path.basename(element));
        assert.strictEqual(output.ext, path.extname(element));
      });
    };
    checkFormat = function(path, testCases) {
      testCases.forEach(function(testCase) {
        assert.strictEqual(path.format(testCase[0]), testCase[1]);
      });
    };
    it('should parse path format', function() {
      checkParseFormat(path, winPaths);
      checkErrors(path);
      checkFormat(path, winSpecialCaseFormatTests);
    });
  });
  describe("toArray", function() {
    it('should convert path string to array', function() {
      assert.deepEqual(path.toArray('c:\\hi\\world\\is'), ['c:\\', 'hi', 'world', 'is']);
      assert.deepEqual(path.toArray('hi/world/is'), ['hi', 'world', 'is']);
      assert.deepEqual(path.toArray('hi/world/is.ext'), ['hi', 'world', 'is.ext']);
    });
  });
  describe("replaceExt", function() {
    it('should replace the path\'s extname', function() {
      assert.strictEqual(path.replaceExt('c:\\dd3\\coffee\\ff.coffee', '.test'), 'c:\\dd3\\coffee\\ff.test');
      assert.strictEqual(path.replaceExt('coffee/coffee.coffee', '.test'), 'coffee/coffee.test');
      assert.strictEqual(path.replaceExt('coffee.coffee', '.test'), 'coffee.test');
    });
  });
});
