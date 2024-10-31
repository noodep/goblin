/**
 * @file webgl attribute defines the caracteristics of a piece of rendering data
 *
 * @author noodep
 * @version 0.38
 */

export default class BufferAttribute {
	/**
	 * Constructs an instance of a BufferAttribute.
	 * @param {number} size - The number of components per vertex attribute. Must be 1, 2, 3, or 4.
	 * @param {GLenum} type - The data type of each component in the array.
	 * @param {number} offset - Offset in bytes of the first component in the vertex attribute array. Must be a multiple of the byte length of type.
	 * @param {number} stride - The distance in bytes between the beginning of consecutive vertex attributes. Can be 0 to indicate that the attributes are tightly packed.
	 */
	constructor(size, type = WebGLRenderingContext.FLOAT, offset = 0, stride = 0) {
		this._size = size;
		this._type = type;
		this._offset = offset;
		this._stride = stride;
	}

	get size() {
		return this._size;
	}

	get type() {
		return this._type;
	}

	get offset() {
		return this._offset;
	}

	get stride() {
		return this._stride;
	}
}
