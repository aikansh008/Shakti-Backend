import format from "./format.js";

function pad(n) {
  return n < 10 ? `0${  n.toString(10)}` : n.toString(10);
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  const d = new Date();
  const time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

/**
 * Logs a message to the console with a timestamp prefix.
 *
 * @param {...any} args - The arguments to log to the console.
 */
export function log() {
  // eslint-disable-next-line no-console
  console.log('%s - %s', timestamp(), format.apply(exports, arguments));
};

/*
module.exports = function(msg, type, depth) {
  if (isNaN(depth)) depth = 10;
  if (!type) type = 'log';
  console[type](inspect(msg, {depth: depth}));
}
*/
export default log;
