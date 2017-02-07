/**
 * @fileOverview Simple Polygon object.
 *
 * @author Noodep
 * @version 0.04
 */

'use strict';

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

