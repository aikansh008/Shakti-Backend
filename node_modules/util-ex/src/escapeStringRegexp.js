/**
 * Escapes a string for use in a regular expression pattern.
 *
 * @param {string} string - The string to be escaped. Must be of type 'string', otherwise a `TypeError` will be thrown.
 * @returns {string} - The escaped string where special characters are escaped to ensure they are not interpreted as special syntax within a regular expression.
 *
 * @example
 * const input = "Hello, world! (It's me.)";
 * const escaped = escapeStringRegexp(input);
 * console.log(escaped); // Outputs: "Hello, world! \(It's me\.\)"
 */
export function escapeStringRegexp(string) {
	if (typeof string !== 'string') {
		throw new TypeError('Expected a string');
	}

	// Escape characters with special meaning either inside or outside character sets.
	// Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
	return string
		.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
		.replace(/-/g, '\\x2d');
}

export default escapeStringRegexp;
