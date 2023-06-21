/**
 * @file Simple Polygon object.
 *
 * @author noodep
 * @version 0.21
 */

export default class Polygon {

	constructor() {
		this._vertices = [];
	}

	get vertices() {
		return this._vertices;
	}

	addVertex(v) {
		this._vertices.push(v);
	}

}
