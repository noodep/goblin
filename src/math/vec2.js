/**
 * @fileOverview 2 components vector manipulation.
 *
 * @author Noodep
 * @version 0.12
 */

'use strict';

const EPSILON32 = Math.pow(2, -23);

export default class Vec2 {

	/**
	 * @constructor
	 * @memberOf module:math
	 * @alias Vec2
	 *
	 * @param {Number} [x=0] - x value.
	 * @param {Number} [y=0] - y value.
	 * @return {module:math.Vec2} - The newly created vector.
	 */
	constructor(x = 0.0, y = 0.0) {
		this._v = new Float32Array(2);
		this._v[0] = x;
		this._v[1] = y;
	}

	/**
	 * Creates a new vector having the same value for all components.
	 *
	 * @param {number} value - The value to set.
	 * @return {module:math.Vec2} - The newly created vector.
	 */
	static fill(value) {
		return new Vec2(value, value);
	}

	/**
	 * Creates a new vector from an Array-like (magnitude property and
	 * integer keys) object (Array, Vec2, Vec3, etc.).
	 *
	 * @param {Array} array - The array containing the values with which to
	 * initialize this vector.
	 * @return {module:math.Vec2} - The newly created vector set with values
	 * from the specified Array.
	 */
	static from(array) {
		return new Vec2(array[0], array[1]);
	}

	/**
	 * Creates a new vector from the two specified vectors.
	 *
	 * @param {module:math:Vec2} u -  The first vector.
	 * @param {module:math:Vec2} v -  The second vector.
	 * @return {module:math.Vec2} - The newly created vector corresponding to
	 * the difference v - u.
	 */
	static difference(u, v) {
		return new Vec2(v._v[0] - u._v[0], v._v[1] - u._v[1]);
	}

	/**
	 * Creates a new identity vector (all component initialized to 1).
	 *
	 * @return {module:math.Vec2} - The newly created vector set to identity.
	 */
	static identity() {
		return new Vec2(1.0, 1.0);
	}

	/**
	 * Creates a new random vector.
	 *
	 * @return {module:math.Vec2} - The newly created vector set with random
	 * values between 0.0 and 1.0.
	 */
	static random() {
		return new Vec2(Math.random(), Math.random());
	}

	/**
	 * Sets the same value for all componenets
	 *
	 * @param {number} value - The value to set.
	 * @return {module:math.Vec2} - The vector with the componenets set.
	 */
	fill(value) {
		this._v.fill(value);
		return this;
	}

	/**
	 * Sets the vector to identiy.
	 *
	 * @return {module:math.Vec2} - This vector.
	 */
	identity() {
		this._v[0] = 1.0;
		this._v[1] = 1.0;

		return this;
	}

	/**
	 * Copies values of vector v2 into this vector.
	 *
	 * @param {module:math.Vec2} v2 - Vector from which to copy values.
	 * @return {module:math.Vec2} - This vector.
	 */
	copy(v2) {
		this._v[0] = v2._v[0];
		this._v[1] = v2._v[1];

		return this;
	}

	/**
	 * Clones this vector.
	 *
	 * @return {module:math.Vec2} - The newly cloned vector.
	 */
	clone() {
		return new Vec2(this._v[0], this._v[1]);
	}

	/**
	 * Test for equality component wise using machine EPSILON for 32 bits (2^-23)
	 *
	 * @param {module:math.Vec2} - The vector with which to make the comparison.
	 * @return {Boolean} - true if this vector and the specified vector have the same components, false otherwise.
	 */
	equals(v2) {
		return Math.abs(this._v[0] - v2._v[0]) < EPSILON32 &&
			Math.abs(this._v[1] - v2._v[1]) < EPSILON32;
	}

	/**
	 * Computes the magnitude of this vector.
	 *
	 * @return {Number} - A scalar representing the magnitude of this vector.
	 */
	magnitude() {
		return Math.hypot(this._v[0], this._v[1]);
	}

	/**
	 * Computes the square of the magnitude of this vector.
	 *
	 * @return {Number} - A scalar representing the square of the magnitude of
	 * this vector.
	 */
	magnitude2() {
		return this._v[0]*this._v[0] + this._v[1]*this._v[1];
	}

	/**
	 * Check if this vector is a unit vector.
	 *
	 * @return {Boolean} - true if this vector is a unit vector, false otherwise.
	 */
	isUnit() {
		return Math.abs(this.magnitude() - 1.0) < EPSILON32;
	}

	/**
	 * Computes the distance from this vector to another vector.
	 *
	 * @param {module:math.Vec2} v2 - The other vector.
	 * @return {Number} - A scalar representing the distance from this vector to
	 * the other vector.
	 */
	distance(v2) {
		return Math.hypot(this._v[0] - v2._v[0], this._v[1] - v2._v[1]);
	}

	/**
	 * Computes the angle in 3D space to a specified vector.
	 *
	 * @param {module:math.Vec2} v2 - The other vector.
	 * @return {Number} - A scalar representing the angle (in radians) from this
	 * vector to the other vector.
	 */
	angle(v2) {
		return Math.acos(this.dot(v2)
				// Only perform 1 sqrt
				/ Math.sqrt(this.magnitude2() * v2.magnitude2()));
	}

	/**
	 * Normalize this vector.
	 *
	 * @return {module:math.Vec2} - This vector normalized.
	 */
	normalize() {
		const mag2 = this.magnitude2();
		if (Math.abs(mag2) < EPSILON32) {
			return this;
		} else {
			return this.scale(1.0 / Math.sqrt(mag2));
		}
	}

	/**
	 * Negates this vector.
	 *
	 * @return {module:math.Vec2} - The negated vector.
	 */
	negate() {
		this._v[0] = -this._v[0];
		this._v[1] = -this._v[1];

		return this;
	}

	/**
	 * Inverts this vector.
	 *
	 * @return {module:math.Vec2} - The inverted vector.
	 */
	invert() {
		this._v[0] = 1.0 / this._v[0];
		this._v[1] = 1.0 / this._v[1];

		return this;
	}

	/**
	 * Multiplies this vector by a scalar.
	 *
	 * @param {Number} n - Scalar by which to multiply this vector.
	 * @return {module:math.Vec2} - The scaled vector.
	 */
	scale(n) {
		this._v[0] *= n;
		this._v[1] *= n;

		return this;
	}

	/**
	 * Multiplies this vector by another vector.
	 *
	 * @param {module:math.Vec2} n - Vector by which to multiply this vector.
	 * @return {module:math.Vec2} - The result of the multiplication.
	 */
	multiply(v2) {
		this._v[0] *= v2._v[0];
		this._v[1] *= v2._v[1];

		return this;
	}

	/**
	 * Computes the dot product of this vector by another vector.
	 *
	 * @param {module:math.Vec2} v2 - Vector by which to compute the dot product.
	 * @return {Number} - The result of the dot product.
	 */
	dot(v2) {
		return this._v[0] * v2._v[0] + this._v[1] * v2._v[1];
	}

	/**
	 * Computes the determinant of this vector and the specified vector.
	 *
	 * @param {module:math.Vec2} v2 - The vector by which to compute the cross product.
	 * @return {module:math.Vec2} - The result of the cross product.
	 */
	det(v2) {
		return this._v[0] * v2._v[1] - this._v[1] * v2._v[0];
	}

	/**
	 * Rotates this vector in R2.
	 *
	 * @param {Number} theta - Angle by which to rotate the vector.
	 * @return {Vec2} - The rotated vector.
	 */
	rotate(theta) {
		const x = this._v[0];
		const y = this._v[1];
		const c = Math.cos(theta);
		const s = Math.sin(theta);

		this._v[0] = x * c - y * s;
		this._v[1] = y * c + x * s;

		return this;
	}

	[Symbol.iterator]() {
		return this._v[Symbol.iterator];
	}

	/**
	 * Returns a human readable string representing this vector.
	 *
	 * @param {Number} [p=16] - The precision to use when printing coordinate
	 * values.
	 * @return {String} - A human readable String representing this vector.
	 */
	toString(p = 16) {
		return `<${this._v[0].toFixed(p)}, ${this._v[1].toFixed(p)}>`;
	}
}

///
/// Define getters and setters for the vector's values by different names,
/// reusing the same functions.
///

const xProperty = {
	get: function() { return this._v[0] },
	set: function(val) { this._v[0] = val }
};

const yProperty = {
	get: function() { return this._v[1] },
	set: function(val) { this._v[1] = val }
};

Object.defineProperty(Vec2.prototype, 'x', xProperty);
Object.defineProperty(Vec2.prototype, 'y', yProperty);

Object.defineProperty(Vec2.prototype, 's', xProperty);
Object.defineProperty(Vec2.prototype, 't', yProperty);

Object.defineProperty(Vec2.prototype, 0, xProperty);
Object.defineProperty(Vec2.prototype, 1, yProperty);

// Some aliases
Vec2.prototype.dist = Vec2.prototype.distance
Vec2.prototype.norm = Vec2.prototype.normal;
Vec2.prototype.mag = Vec2.prototype.magnitude;
Vec2.prototype.mag2 = Vec2.prototype.magnitude2;
Vec2.prototype.mul = Vec2.prototype.multiply;

/**
 * Make Vec2s act like arrays
 */
Vec2.prototype[Symbol.isConcatSpreadable] = true;
Vec2.prototype.length = 2;

/**
 * Class to create a Vec2 who's componenets are stored in a specified
 * ArrayBuffer.
 *
 * @constructor
 * @param {ArrayBuffer} buffer - The buffer to use.
 * @param {Number} [byteOffset=0] - The byte offset in the buffer.
 * @return {module:math.Vec2View} - The newly created vector.
 */
export function Vec2View(buffer, byteOffset = 0) {
	this._v = new Float32Array(buffer, byteOffset, 2);
}
// Have to do inheritance like this because the other way requires calling
// super() in the constructor.
Vec2View.prototype = Object.create(Vec2.prototype);

/**
 * Some common vector constants to avoid the creation of new ones.
 * @see Vec3 for why one should be carful when using this.
 */
Vec2.NULL = new Vec2(0.0, 0.0);
Vec2.IDENTITY = Vec2.identity();

