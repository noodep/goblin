/**
 * @file uuid utilities
 *
 * @author noodep
 * @version 0.15
 */

const hex = new Array(256);
for (let i = 0 ; i < 256 ; i++)
	hex[i] = i.toString(16).padStart(2, 0);

export const uuidv4 = crypto.randomUUID?.bind(crypto) || _uuidv4;

/**
 * polyfill for cases where randomUUID is only exposed in secure contexts
 */
function _uuidv4() {
	const a = crypto.getRandomValues(new Uint8Array(16));

	// sets the 6th octet four most significant bits to 0b0100 to represent uuid version 4
	a[6] = a[6] & 0b00001111 | 0b01000000;
	// sets the 8th octet two most significant bits to 0b10 to represent uuid variant
	a[8] = a[8] & 0b00111111 | 0b10000000;

	return hex[a[0]] + hex[a[1]] + hex[a[2]] + hex[a[3]] +
		'-' +
		hex[a[4]] + hex[a[5]] +
		'-' +
		hex[a[6]] + hex[a[7]] +
		'-' +
		hex[a[8]] + hex[a[9]] +
		'-' +
		hex[a[10]] + hex[a[11]] + hex[a[12]] + hex[a[13]] + hex[a[14]] + hex[a[15]];
}
