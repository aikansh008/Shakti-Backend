# path.js [![Build Status](https://img.shields.io/travis/snowyu/path.js/master.png)](http://travis-ci.org/snowyu/path.js) [![npm](https://img.shields.io/npm/v/path.js.svg)](https://npmjs.org/package/path.js) [![downloads](https://img.shields.io/npm/dm/path.js.svg)](https://npmjs.org/package/path.js) [![license](https://img.shields.io/npm/l/path.js.svg)](https://npmjs.org/package/path.js)

Browser-friendly enhanced `path` fully compatible with standard node.js
[path](http://nodejs.org/api/path.html)

A lightweight, cross-platform library for manipulating paths.

This package modifies and enhances the standard `path` from node.js

## API

### Path Class

```js
import { Path } from 'path.js';

// Default constructor with optional string or object parameter
const myPath = new Path('custom_separator'); // String: sets custom path separator
const myPathWithOptions = new Path({
  sep: 'custom_separator', // Custom path separator
  delimiter: 'custom_delimiter', // Custom path delimiter
  splitPathReStr: 'custom_regular_expression', // Custom regular expression for splitting paths
});
```

Properties

* sep: The path separator character. Can be set at instantiation or later via a getter/setter.
* delimiter: The path delimiter character. Can be set at instantiation or later via a getter/setter.
* splitPathReStr: A string representing a regular expression used to split paths. Must include the placeholder &SEP&, which will be replaced with the current sep. Can be set at instantiation or later via a getter/setter.

Methods

- updateSplitPathRe(): Updates the internal splitPathRe regular expression based on the current splitPathReStr and sep.
- splitPath(filename): Splits a given filename using the current splitPathRe and returns the resulting array.
- toArray(aPath): Converts a given aPath to an array of path segments, trimming any leading or trailing empty elements.
- normalizeArray(parts, allowAboveRoot): Normalizes an array of path segments, resolving . and .. elements, and optionally allowing paths above the root.
- trimArray(arr): Removes leading and trailing empty elements from the given array.
- isAbsolute(path): Returns true if the given path is absolute, false otherwise.
- normalize(path): Normalizes the given path, resolving . and .. elements, removing redundant separators, and ensuring proper absolute or relative form.
- cwd(): Returns the current working directory as a string ('.' for default implementation).
- resolveArray(): Resolves a sequence of paths or path segments into an absolute path, taking the current working directory into account.
- _join(): Internal method for joining path segments, handling arrays and strings.
- join(): Joins multiple path segments into a single path, normalizing and resolving relative segments.
- _isSame(aDir1, aDir2): Compares two directories for equality, returning true if they are the same, false otherwise.
- relative(from, to): Computes the relative path from from to to.
- dirname(path): Extracts the directory name from the given path.
- basename(path, ext): Extracts the base name from the given path, optionally removing a specified extension.
- replaceExt(path, ext): Replaces the extension of the given path with a new one.
- extname(path): Extracts the extension from the given path.
- format(pathObject): Constructs a path string from an object with root, dir, and base properties.
- parse(pathString): Parses a path string into an object with root, dir, base, ext, and name properties.
- _makeLong(path): Returns the given path unchanged (internal placeholder for potential long path handling).

### WinPath Class

```js
import { WinPath } from 'path.js';
import path from 'path.js';

// path.win32
const winPath = new WinPath();
```

### PosixPath class

```js
import { PosixPath } from 'path.js';
import path from 'path.js';

// path.posix
const posixPath = new PosixPath();
```

## Usage

```js
import { Path, WinPath, PosixPath } from 'path.js';
import path from 'path.js';

// Using the default Path class
const _path = new Path();
console.log(_path.normalize('/path/to/../file.ext')); // '/path/file.ext'

// Using the WinPath subclass or path.win32
const winPath = new WinPath();

console.log(winPath.normalize('C:\\path\\to\\..\\file.ext')); // 'C:\path\file.ext'

// Using the PosixPath subclass or path.posix
const posixPath = new PosixPath();

console.log(posixPath.normalize('/path/to/../file.ext')); // '/path/file.ext'
```
