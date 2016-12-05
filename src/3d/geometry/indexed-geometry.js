/**
 * @fileOverview Indexed geometry used to render using drawElements.
 *
 * @author Noodep
 * @version 0.1
 */

export default class IndexedGeometry {
	constructor(indices, vertices, type) {
		this._indices = indices;
		this._vertices = vertices;
		this._type = type;
	}

	get indices() {
		return this._indices;
	}

	get vertices() {
		return this._vertices;
	}

	get type() {
		return this._type;
	}
}

