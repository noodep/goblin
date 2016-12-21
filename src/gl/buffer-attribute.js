/**
 * @fileOverview GL Attribute defines the caracteristics of a piece of rendering data.
 *
 * @author Noodep
 * @version 0.2
 */

export default class BufferAttribute {

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

