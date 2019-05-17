/**
 * @file Simple Polygon object.
 *
 * @author Noodep
 * @version 0.06
 */

export default class Polygon {

	constructor() {
		this._vertices = new Array();
	}

	get vertices() {
		return this._vertices;
	}

	addVertex(v) {
		this._vertices.push(v);
	}

}

