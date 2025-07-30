import sinonChai from "sinon-chai";
import sinon from "sinon";
import chai from "chai";
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();
chai.use(sinonChai);

import {Path} from '../src/path'

const path = new Path;

const commonTests = [[['/', '/', '.', '..', 'b', 'c.js'], '/b/c.js'], [['.', 'x', 'b', '..', 'b', 'c.js'], 'x/b/c.js'], [['/.', 'x', 'b', '..', 'b', 'c.js'], '/x/b/c.js'], [['/foo', '../../../bar'], '/bar'], [['.', 'foo', '../../../bar'], '../../bar'], [['.', 'foo/', '../../../bar'], '../../bar'], [['.', 'foo/x', '../../../bar'], '../bar'], [['foo/x', './bar'], 'foo/x/bar'], [['foo/x/', './bar'], 'foo/x/bar'], [['foo/x/', '.', 'bar'], 'foo/x/bar'], [['.', '.', '.'], '.'], [['.', './', '.'], '.'], [['.'], '.'], [['', '.'], '.'], [['', 'foo'], 'foo'], [['', '/foo'], '/foo'], [['', '', '/foo'], '/foo'], [['', '', 'foo'], 'foo'], [['foo', ''], 'foo'], [['/'], '/'], [['/', '.'], '/'], [['/', '..'], '/'], [['/', '..', '..'], '/'], [[''], '.'], [['', ''], '.'], [[' /foo'], ' /foo'], [[' ', 'foo'], ' /foo'], [[' ', '.'], ' '], [[' ', ''], ' '], [['/', 'foo'], '/foo'], [['/', '/foo'], '/foo'], [['/', '//foo'], '/foo'], [['/', '', '/foo'], '/foo'], [['', '/', 'foo'], '/foo'], [['', '/', '/foo'], '/foo']];

const joinTests = commonTests.slice();

joinTests.push([['.', '/./', '.'], '.'], [['foo', '', '/bar'], 'foo/bar'], [['./', '..', '/foo'], '../foo'], [['foo', '/bar'], 'foo/bar'], [['foo/', ''], 'foo/'], [['./', '..', '..', '/foo'], '../../foo'], [['.', '..', '..', '/foo'], '../../foo'], [['', '.', '..', '..', '/foo'], '../../foo'], [[' ', '/'], ' /'], [['./'], './'], [['.', './'], './'], [['.', '/////./', '.'], '.']);

const resolveTests = commonTests.slice();

resolveTests.push([['.', '/./', '.'], '/'], [['foo', '', '/bar'], '/bar'], [['./', '..', '/foo'], '/foo'], [['foo', '/bar'], '/bar'], [['foo/', ''], 'foo'], [['./', '..', '..', '/foo'], '/foo'], [['.', '..', '..', 'foo'], '../../foo'], [['', '.', '..', '..', '/foo'], '/foo'], [['', '.', '..', '..', 'foo'], '../../foo'], [[' ', '/'], '/'], [['./'], '.'], [['.', './'], '.'], [['/var/lib', '../', 'file/'], '/var/file'], [['/var/lib', '/../', 'file/'], '/file'], [['a/b/c/', '../../..'], '.'], [['/some/dir', '.', '/absolute/'], '/absolute'], [['.', '/////./', '.'], '/']);

const relativeTests = [['/var/lib', '/var', '..'], ['/var/lib', '/bin', '../../bin'], ['/var/lib', '/var/lib', ''], ['/var/lib', '/var/apache', '../apache'], ['/var/', '/var/lib', 'lib'], ['/', '/var/lib', 'var/lib']];

describe("general path functions", function() {
  const _splitPathReStr = '^(&SEP&?|)([\\s\\S]*?)((?:\\.{1,2}|[^' + '&SEP&]+?|)(\\.[^.&SEP&]*|))(?:[&SEP&]*)$';
  it("should detect default configs", function() {
    path.sep.should.be.equal('/');
    path.delimiter.should.be.equal(':');
    path.splitPathReStr.should.be.equal(_splitPathReStr);
  });
  it("should change default configs", function() {
    var result;
    path.sep = '?';
    path.sep.should.be.equal('?');
    path.delimiter = ';';
    path.delimiter.should.be.equal(';');
    result = path.splitPath('?sdsd?asas?sdd.com');
    result.should.be.deep.equal(['?', 'sdsd?asas?', 'sdd.com', '.com']);
    path.sep = '/';
    path.delimiter = ':';
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
      joinTests.forEach(function(test) {
        var actual, expected;
        actual = path.normalizeArray(path.trimArray(test[0]).join(path.sep).split(path.sep));
        expected = path.trimArray(test[1].split(path.sep));
        if (expected.length === 1 && expected[0] === '.') {
          expected = [];
        }
        actual.should.be.deep.equal(expected);
      });
    });
  });
  describe("normalize", function() {
    it('should normalize path', function() {
      joinTests.forEach(function(test) {
        var actual, expected;
        actual = path.normalize(path.trimArray(test[0]).join(path.sep));
        expected = test[1];
        actual.should.be.deep.equal(expected);
      });
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
      path.join().should.be.equal('.');
      joinTests.forEach(function(test) {
        var actual, expected;
        actual = path.join.apply(path, test[0]);
        expected = test[1];
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
      f = '/sddsds/aasas/ddd/test/path-test.coffee';
      assert.equal(path.basename(f), 'path-test.coffee');
      assert.equal(path.basename(f, '.coffee'), 'path-test');
      assert.equal(path.basename(''), '');
      assert.equal(path.basename('/dir/basename.ext'), 'basename.ext');
      assert.equal(path.basename('/basename.ext'), 'basename.ext');
      assert.equal(path.basename('basename.ext'), 'basename.ext');
      assert.equal(path.basename('basename.ext/'), 'basename.ext');
      assert.equal(path.basename('basename.ext//'), 'basename.ext');
      assert.equal(path.basename('\\dir\\basename.ext'), '\\dir\\basename.ext');
      assert.equal(path.basename('\\basename.ext'), '\\basename.ext');
      assert.equal(path.basename('basename.ext'), 'basename.ext');
      assert.equal(path.basename('basename.ext\\'), 'basename.ext\\');
      assert.equal(path.basename('basename.ext\\\\'), 'basename.ext\\\\');
      f = 'Icon' + String.fromCharCode(13);
      assert.equal(path.basename('/a/b/' + f), f);
    });
  });
  describe("dirname", function() {
    it('should get dirname from path', function() {
      var f;
      f = '/sddsds/aasas/ddd/test/path-test.coffee';
      assert.equal(path.dirname(f).substr(-4), 'test');
      assert.equal(path.dirname('/a/b/'), '/a');
      assert.equal(path.dirname('/a/b'), '/a');
      assert.equal(path.dirname('/a'), '/');
      assert.equal(path.dirname(''), '.');
      assert.equal(path.dirname('/'), '/');
      assert.equal(path.dirname('////'), '/');
    });
  });
  describe("extname", function() {
    it('should get ext name from path', function() {
      var f;
      f = '/sddsds/aasas/ddd/test/path-test.coffee';
      assert.equal(path.extname(f), '.coffee');
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
      assert.equal(path.extname('..\\'), '.\\');
      assert.equal(path.extname('file.ext\\'), '.ext\\');
      assert.equal(path.extname('file.ext\\\\'), '.ext\\\\');
      assert.equal(path.extname('file\\'), '');
      assert.equal(path.extname('file\\\\'), '');
      assert.equal(path.extname('file.\\'), '.\\');
      assert.equal(path.extname('file.\\\\'), '.\\\\');
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
    var checkErrors, checkFormat, checkParseFormat, errors, unixPaths, unixSpecialCaseFormatTests;
    unixPaths = ['/home/user/dir/file.txt', '/home/user/a dir/another File.zip', '/home/user/a dir//another&File.', '/home/user/a$$$dir//another File.zip', 'user/dir/another File.zip', 'file', '.\\file', './file', 'C:\\foo'];
    unixSpecialCaseFormatTests = [
      [
        {
          dir: 'some/dir'
        }, 'some/dir/'
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
        assert.strictEqual(path.format(output), element.replace(/[\/]{2}/g, path.sep));
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
      checkParseFormat(path, unixPaths);
      checkErrors(path);
      checkFormat(path, unixSpecialCaseFormatTests);
    });
  });
  describe("toArray", function() {
    it('should convert path string to array', function() {
      assert.deepEqual(path.toArray('/hi/world/is'), ['hi', 'world', 'is']);
      assert.deepEqual(path.toArray('hi/world/is'), ['hi', 'world', 'is']);
    });
  });
  describe("replaceExt", function() {
    it('should replace the path\'s extname', function() {
      assert.strictEqual(path.replaceExt('/dd3/coffee/ff.coffee', '.test'), '/dd3/coffee/ff.test');
      assert.strictEqual(path.replaceExt('coffee/coffee.coffee', '.test'), 'coffee/coffee.test');
      assert.strictEqual(path.replaceExt('coffee.coffee', '.test'), 'coffee.test');
    });
  });
});
