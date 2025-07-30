import isObject from './is/type/object.js';
import isNull from './is/type/null.js';
import isString from './is/type/string.js';
import inspect from './inspect.js';

const formatRegExp = /%[sdj%]/g;
/**
 * Formats a string using placeholder tokens.
 *
 * If the first argument is a string, it is treated as a format string that
 * specifies placeholders for the subsequent arguments, which will be inserted
 * into the string in place of the placeholders. The placeholders are
 * specified using '%s' for string, '%d' for number, and '%j' for JSON.
 *
 * If the first argument is not a string, all arguments will be inspected and
 * concatenated into a space-separated string.
 *
 * @param {string|any} f - The format string or object to be formatted.
 * @param {...any} args - The values to be inserted into the format string.
 * @returns {string} The formatted string.
 *
 * @example
 * format('%s %s', 'hello', 'world'); // 'hello world'
 * format('%d %s', 42, 'answer'); // '42 answer'
 * format('%j', { foo: 'bar' }); // '{'foo':'bar'}'
 * format('no placeholders', 'needed'); // 'no placeholders needed'
 */
export function format(f) {
  let i;
  if (!isString(f)) {
    const objects = [];
    for (i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }
  i = 1;
  const args = arguments;
  const len = args.length;
  let str = String(f).replace(formatRegExp, (x) => {
    if (x === '%%') {return '%.js';}
    if (i >= len) {return x;}
    switch (x) {
      case '%s':
        return String(args[i++]);
      case '%d':
        return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular].js';
        }
      default:
        return x;
    }
  });
  for (let x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ` ${  x}`;
    } else {
      str += ` ${  inspect(x)}`;
    }
  }
  return str;
};

export default format;
