/**
 * @fileOverview Some (non-secure) hash functions.
 *
 * @author Zach Peltzer
 * @version 0.00
 */

/**
 * Generates a hash for the specified string. This is taken from Java's
 * String.hashCode() method and (as far as I know and have tested) is
 * compatible.
 *
 * @param {string} str - The string.
 * @return {number} - The hash of the string or null if s is not a string.
 */
export function strHash(str) {
	if (typeof str === 'string' || str instanceof String) {
		var hash = 0;
		for (let i = 0; i < str.length; i++) {
			// Truncate to an integer
			hash = (Math.imul(hash, 31) + str.charCodeAt(i)) | 0;
		}

		return hash;
	} else {
		return null;
	}
}

