/**
 * @fileOverview Polygon triangulation utility
 * @author Noodep
 * @version 0.13
 */

'use strict';

import Vec2 from '../vec2.js';

export default class Triangulator {

	/**
	 * @constructor
	 * @memberOf module:math
	 * @alias Triangulator
	 *
	 * @param {Number} [x=0] - x value.
	 * @param {Number} [y=0] - y value.
	 * @return {module:math.Triangulator} - The newly created vector.
	 */
	constructor(polygon) {
		this._p = Array.from(polygon.vertices);
		this._active = new Array(this._p.length).fill(true);
		this._triangles = new Array(this._p.length - 2);
		this._triangle_count = 0;
	}

	/**
	 * Returns the list of triangles (as indices) composing the triangulated polygon.
	 *
	 * @return {Array} - List of triangles as indices.
	 */
	get triangles() {
		return this._triangles;
	}

	/**
	 * Triangulates this triangulator polygon. Returns a promise that resolves with the list of triangle indices.
	 * Promises are scheduled as micro tasks. This will still block the thread it is running on. Consider triangulating
	 * from a worker.
	 *
	 * @return {Promise} - A promise that resolves when the triangulation is done.
	 */
	triangulate() {
		return new Promise((resolve, reject) => {
			const result = this._triangulate();
			if(result)
				resolve(this._triangles);
			else
				reject(undefined);
		});
	}

	_triangulate() {
		let p0 = 0;
		let p1 = 1;
		let n0 = this._p.length - 1;
		let n1 = this._p.length - 2;
		let last_positive = true;
		let start = p1;

		while(true) {
			// Only three vertices remaining.
			if(p1 == n1) {
				// console.log('Only three vertices, last triangle !');
				this._addTriangle(n0, p0, p1);
				return true;
			}

			let is_positive_ear = this._isEar(n0, p0, p1);
			let is_negative_ear = this._isEar(n1, n0, p0);

			if(is_positive_ear && is_negative_ear)
			{
				const pn0 = this._p[n0];
				const pn1 = this._p[n1];
				const pp0 = this._p[p0];
				const pp1 = this._p[p1];

				const n0n1 = Vec2.fromVectors(pn0, pn1).normalize();
				const n0p1 = Vec2.fromVectors(pn0, pp1).normalize();
				const p0n1 = Vec2.fromVectors(pp0, pn1).normalize();
				const p0p1 = Vec2.fromVectors(pp0, pp1).normalize();
				const dot_negative = n0p1.dot(n0n1);
				const dot_positive = p0n1.dot(p0p1);

				// Same angle, choose based on previous
				if(Math.abs(dot_positive - dot_negative)) {
					if(last_positive)
						is_negative_ear = false
					else
						is_positive_ear = false;
				}
				else
				{
					if(dot_positive > dot_negative)
						is_negative_ear = false;
					else
						is_positive_ear = false;
				}
			}

			if(is_positive_ear)
			{
				last_positive = true;
				this._addTriangle(n0, p0, p1);
				this._active[p0] = false;
				p0 = p1;
				p1 = this._nextActive(p1);
				// resets start so we can identify if and when we went full circle without finding an ear
				// in which case we should exit the loop
				start = p1;
			}
			else if(is_negative_ear)
			{
				last_positive = false;
				this._addTriangle(n1, n0, p0);
				this._active[n0] = false;
				n0 = n1;
				n1 = this._prevActive(n1);
				// resets start so we can identify if and when we went full circle without finding an ear
				// in which case we should exit the loop
				start = p1;
			}
			else
			{
				n1 = n0;
				n0 = p0;
				p0 = p1;
				p1 = this._nextActive(p1);

				if(start == p1)
				{
					console.warn('We went full circle without finding an ear. Cancelling!');
					this._triangles = undefined;
					this._triangle_count = 0;
					return false;
				}
			}
		}
	}

	_addTriangle($1, $2, $3) {
		const t = [$1, $2, $3]
		this._triangles[this._triangle_count++] = t;
	}

	// Checks if the 3 specified vertices form an 'ear' of the remaining polygon.
	_isEar($1, $2, $3) {
		const epsilon = 0.00000001;
		const p1 = this._p[$1];
		const p2 = this._p[$2];
		const p3 = this._p[$3];
		const v12 = new Vec2(p2.x - p1.x, p2.y - p1.y).normalize();
		const v13 = new Vec2(p3.x - p1.x, p3.y - p1.y).normalize();

		// Checks if wound anticlockwise
		if(v12.det(v13) < epsilon)
			return false;

		const vertex_count = this._p.length;
		// For each active vertex, checks if it lies inside the tirangle.
		for(let idx = 0 ; idx < vertex_count ; idx++)
		{
			if(this._active[idx] && idx != $1 && idx != $2 && idx != $3) {
				const q = this._p[idx];

				// Check if the current vertex lies on the positive side of each of this triangle edges.
				const n12 = new Vec2(-(p2.y - p1.y), p2.x - p1.x).normalize();
				const p1q = new Vec2(q.x - p1.x, q.y - p1.y).normalize();
				const n23 = new Vec2(-(p3.y - p2.y), p3.x - p2.x).normalize();
				const p2q = new Vec2(q.x - p2.x, q.y - p2.y).normalize();
				const n31 = new Vec2(-(p1.y - p3.y), p1.x - p3.x).normalize();
				const p3q = new Vec2(q.x - p3.x, q.y - p3.y).normalize();

				if(p1q.dot(n12) > epsilon && p2q.dot(n23) > epsilon && p3q.dot(n31) > epsilon)
					return false;
			}
		}
		return true;
	}

	_nextActive(index) {
		while(true) {
			if(++index == this._p.length)
				index = 0;

			if(this._active[index])
				return index;
		}
	}

	_prevActive(index) {
		while(true) {
			if(--index == -1)
				index = this._p.length - 1;

			if(this._active[index])
				return index;
		}
	}
}

